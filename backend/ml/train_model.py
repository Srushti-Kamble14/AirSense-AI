"""Train, compare, evaluate, and save the AirSenseAI AQI model."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBRegressor

from ml.evaluate import regression_metrics, save_evaluation_plots
from ml.preprocess import build_preprocessor, load_dataset, make_training_frame, profile_dataset


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "datasets" / "delhi_ncr_aqi_dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
FEATURE_DEFAULTS_PATH = MODEL_DIR / "feature_defaults.pkl"
METRICS_PATH = MODEL_DIR / "metrics.json"
PROFILE_PATH = MODEL_DIR / "dataset_profile.json"


def candidate_models() -> dict[str, tuple[Any, bool]]:
    return {
        "Random Forest Regressor": (
            RandomForestRegressor(
                n_estimators=160,
                random_state=42,
                n_jobs=-1,
                max_depth=None,
                min_samples_leaf=2,
            ),
            False,
        ),
        "XGBoost Regressor": (
            XGBRegressor(
                n_estimators=350,
                learning_rate=0.06,
                max_depth=6,
                subsample=0.9,
                colsample_bytree=0.9,
                objective="reg:squarederror",
                random_state=42,
                n_jobs=-1,
                eval_metric="rmse",
            ),
            False,
        ),
        "Gradient Boosting Regressor": (
            GradientBoostingRegressor(random_state=42),
            False,
        ),
        "Decision Tree Regressor": (
            DecisionTreeRegressor(random_state=42, min_samples_leaf=3),
            False,
        ),
        "Linear Regression": (
            LinearRegression(),
            True,
        ),
    }


def feature_defaults(X: pd.DataFrame) -> dict[str, Any]:
    defaults: dict[str, Any] = {}
    for column in X.columns:
        if pd.api.types.is_numeric_dtype(X[column]):
            value = X[column].median()
            defaults[column] = None if pd.isna(value) else float(value)
        else:
            mode = X[column].mode(dropna=True)
            defaults[column] = None if mode.empty else mode.iloc[0]
    return defaults


def train_and_compare(X_train: pd.DataFrame, X_test: pd.DataFrame, y_train: pd.Series, y_test: pd.Series) -> tuple[str, Pipeline, list[dict[str, float | str]]]:
    results: list[dict[str, float | str]] = []
    trained: dict[str, Pipeline] = {}

    for name, (estimator, needs_scaling) in candidate_models().items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor(X_train, scale_numeric=needs_scaling)),
                ("model", estimator),
            ]
        )
        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
        metrics = regression_metrics(y_test, predictions)
        results.append({"model": name, **metrics})
        trained[name] = pipeline
        print(
            f"{name}: MAE={metrics['mae']:.4f}, "
            f"RMSE={metrics['rmse']:.4f}, R2={metrics['r2']:.4f}"
        )

    ranked = sorted(results, key=lambda row: (float(row["rmse"]), -float(row["r2"])))
    best_name = str(ranked[0]["model"])
    return best_name, trained[best_name], ranked


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    profile = profile_dataset(str(DATASET_PATH))
    print("Dataset profile")
    print(f"Rows: {profile.rows}")
    print(f"Columns: {profile.columns}")
    print(f"Column names: {profile.column_names}")
    print(f"Data types: {profile.dtypes}")
    print(f"Missing values: {profile.missing_values}")
    print(f"Duplicate rows: {profile.duplicate_rows}")
    print(f"Target column: {profile.target_column}")
    print("Selected features and reasons:")
    for feature in profile.selected_features:
        print(f"- {feature}: {profile.feature_reasons[feature]}")

    df = load_dataset(str(DATASET_PATH))
    X, y = make_training_frame(df, profile.selected_features, profile.target_column)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
    )

    best_name, best_model, ranked_results = train_and_compare(X_train, X_test, y_train, y_test)
    y_pred = best_model.predict(X_test)
    best_metrics = regression_metrics(y_test, y_pred)
    plot_paths = save_evaluation_plots(best_model, X_test, y_test, profile.selected_features, MODEL_DIR)

    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(profile.selected_features, FEATURE_COLUMNS_PATH)
    joblib.dump(feature_defaults(X), FEATURE_DEFAULTS_PATH)

    output = {
        "dataset": str(DATASET_PATH),
        "target_column": profile.target_column,
        "selected_features": profile.selected_features,
        "rejected_columns": profile.rejected_columns,
        "feature_reasons": profile.feature_reasons,
        "model_comparison": ranked_results,
        "selected_model": best_name,
        "selected_model_reason": (
            "Selected because it achieved the lowest RMSE on the held-out 20% test split; "
            "R2 is used as the tie-breaker."
        ),
        "test_metrics": best_metrics,
        "plots": plot_paths,
    }

    save_json(PROFILE_PATH, profile.__dict__)
    save_json(METRICS_PATH, output)

    print("\nBest model")
    print(best_name)
    print(json.dumps(best_metrics, indent=2))
    print(f"Saved model: {MODEL_PATH}")
    print(f"Saved feature columns: {FEATURE_COLUMNS_PATH}")
    print(f"Saved metrics: {METRICS_PATH}")


if __name__ == "__main__":
    main()

