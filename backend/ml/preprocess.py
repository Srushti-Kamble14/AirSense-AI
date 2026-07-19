"""Data inspection, cleaning, and preprocessing helpers for AQI modeling."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


TARGET_CANDIDATES = ("aqi", "air_quality_index")
LEAKAGE_COLUMNS = {"aqi_category", "category", "air_quality_category"}
TIMESTAMP_COLUMNS = {"datetime", "date", "timestamp", "created_at", "updated_at"}
PREFERRED_FEATURE_KEYWORDS = (
    "pm25",
    "pm2.5",
    "pm10",
    "no2",
    "so2",
    "co",
    "o3",
    "temperature",
    "temp",
    "humidity",
    "wind",
    "visibility",
    "latitude",
    "longitude",
    "month",
    "hour",
    "day",
    "weekend",
    "season",
    "city",
    "station",
)


@dataclass(frozen=True)
class DatasetProfile:
    path: str
    rows: int
    columns: int
    column_names: list[str]
    dtypes: dict[str, str]
    missing_values: dict[str, int]
    duplicate_rows: int
    target_column: str
    selected_features: list[str]
    rejected_columns: dict[str, str]
    feature_reasons: dict[str, str]


class OutlierClipper(BaseEstimator, TransformerMixin):
    """Clip numeric columns to learned quantile bounds."""

    def __init__(self, lower_quantile: float = 0.01, upper_quantile: float = 0.99):
        self.lower_quantile = lower_quantile
        self.upper_quantile = upper_quantile

    def fit(self, X: Any, y: Any = None) -> "OutlierClipper":
        frame = pd.DataFrame(X)
        self.lower_bounds_ = frame.quantile(self.lower_quantile)
        self.upper_bounds_ = frame.quantile(self.upper_quantile)
        return self

    def transform(self, X: Any) -> np.ndarray:
        frame = pd.DataFrame(X)
        clipped = frame.clip(self.lower_bounds_, self.upper_bounds_, axis=1)
        return clipped.to_numpy()


def load_dataset(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def detect_target_column(df: pd.DataFrame) -> str:
    normalized = {column.lower().strip(): column for column in df.columns}
    for candidate in TARGET_CANDIDATES:
        if candidate in normalized:
            return normalized[candidate]
    raise ValueError(
        "Could not detect target column. Expected one of: "
        + ", ".join(TARGET_CANDIDATES)
    )


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.drop_duplicates().copy()
    cleaned.columns = [column.strip() for column in cleaned.columns]
    return cleaned


def _feature_reason(column: str, dtype: Any) -> str:
    name = column.lower()
    if any(token in name for token in ("pm25", "pm2.5", "pm10", "no2", "so2", "co", "o3")):
        return "Pollutant concentration directly drives AQI levels."
    if "temperature" in name or name == "temp":
        return "Temperature influences pollutant formation and dispersion."
    if "humidity" in name:
        return "Humidity changes particulate behavior and visibility."
    if "wind" in name:
        return "Wind speed affects pollutant dispersion."
    if "visibility" in name:
        return "Visibility is strongly inversely related to particulate pollution."
    if name in {"latitude", "longitude"}:
        return "Coordinates capture spatial variation between monitoring areas."
    if name in {"month", "hour", "day", "is_weekend"} or "weekend" in name:
        return "Time features capture seasonal, daily, and traffic-pattern effects."
    if name in {"season", "city", "station", "day_of_week"}:
        return "Categorical context captures location and calendar patterns."
    if pd.api.types.is_numeric_dtype(dtype):
        return "Numeric feature retained because it may contain predictive signal."
    return "Low-cardinality categorical feature retained for contextual signal."


def select_features(df: pd.DataFrame, target_column: str) -> tuple[list[str], dict[str, str], dict[str, str]]:
    selected: list[str] = []
    rejected: dict[str, str] = {}
    reasons: dict[str, str] = {}

    for column in df.columns:
        normalized = column.lower().strip()
        dtype = df[column].dtype

        if column == target_column:
            rejected[column] = "Target column."
            continue
        if normalized in LEAKAGE_COLUMNS:
            rejected[column] = "Derived from AQI and would leak the target."
            continue
        if normalized in TIMESTAMP_COLUMNS:
            rejected[column] = "Raw timestamp/date has high cardinality; derived time columns are safer."
            continue

        is_preferred = any(keyword in normalized for keyword in PREFERRED_FEATURE_KEYWORDS)
        is_numeric = pd.api.types.is_numeric_dtype(dtype)
        unique_count = int(df[column].nunique(dropna=True))
        low_cardinality_categorical = not is_numeric and unique_count <= 50

        if is_preferred or is_numeric or low_cardinality_categorical:
            selected.append(column)
            reasons[column] = _feature_reason(column, dtype)
        else:
            rejected[column] = f"Excluded because it is high-cardinality/non-predictive ({unique_count} unique values)."

    if not selected:
        raise ValueError("No usable feature columns were selected.")

    return selected, rejected, reasons


def profile_dataset(path: str) -> DatasetProfile:
    df = load_dataset(path)
    target_column = detect_target_column(df)
    selected, rejected, reasons = select_features(df, target_column)

    return DatasetProfile(
        path=path,
        rows=int(df.shape[0]),
        columns=int(df.shape[1]),
        column_names=list(df.columns),
        dtypes={column: str(dtype) for column, dtype in df.dtypes.items()},
        missing_values={column: int(value) for column, value in df.isna().sum().items()},
        duplicate_rows=int(df.duplicated().sum()),
        target_column=target_column,
        selected_features=selected,
        rejected_columns=rejected,
        feature_reasons=reasons,
    )


def build_preprocessor(
    X: pd.DataFrame,
    scale_numeric: bool = False,
    clip_outliers: bool = True,
) -> ColumnTransformer:
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = [column for column in X.columns if column not in numeric_features]

    numeric_steps: list[tuple[str, Any]] = [("imputer", SimpleImputer(strategy="median"))]
    if clip_outliers:
        numeric_steps.append(("outlier_clipper", OutlierClipper()))
    if scale_numeric:
        numeric_steps.append(("scaler", StandardScaler()))

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    transformers: list[tuple[str, Any, list[str]]] = []
    if numeric_features:
        transformers.append(("numeric", Pipeline(numeric_steps), numeric_features))
    if categorical_features:
        transformers.append(("categorical", categorical_transformer, categorical_features))

    return ColumnTransformer(transformers=transformers, remainder="drop")


def make_training_frame(df: pd.DataFrame, features: list[str], target_column: str) -> tuple[pd.DataFrame, pd.Series]:
    training = clean_data(df)
    X = training[features].copy()
    y = pd.to_numeric(training[target_column], errors="coerce")
    valid_target = y.notna()
    return X.loc[valid_target].copy(), y.loc[valid_target].copy()
