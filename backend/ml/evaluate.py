"""Evaluation metrics and plots for AQI regression models."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def regression_metrics(y_true: pd.Series, y_pred: np.ndarray) -> dict[str, float]:
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": float(r2_score(y_true, y_pred)),
    }


def _transformed_feature_names(model_pipeline: Any, raw_features: list[str]) -> list[str]:
    preprocessor = model_pipeline.named_steps["preprocessor"]
    try:
        return preprocessor.get_feature_names_out(raw_features).tolist()
    except Exception:
        return raw_features


def save_feature_importance_plot(model_pipeline: Any, raw_features: list[str], output_path: Path) -> None:
    estimator = model_pipeline.named_steps["model"]
    if hasattr(estimator, "feature_importances_"):
        names = _transformed_feature_names(model_pipeline, raw_features)
        importances = estimator.feature_importances_
        ranked = sorted(zip(names, importances, strict=False), key=lambda item: item[1], reverse=True)[:20]
        labels = [item[0].replace("numeric__", "").replace("categorical__", "") for item in ranked]
        values = [item[1] for item in ranked]
    elif hasattr(estimator, "coef_"):
        names = _transformed_feature_names(model_pipeline, raw_features)
        coefficients = np.abs(np.ravel(estimator.coef_))
        ranked = sorted(zip(names, coefficients, strict=False), key=lambda item: item[1], reverse=True)[:20]
        labels = [item[0].replace("numeric__", "").replace("categorical__", "") for item in ranked]
        values = [item[1] for item in ranked]
    else:
        labels = raw_features
        values = [0.0 for _ in raw_features]

    plt.figure(figsize=(12, 7))
    plt.barh(labels[::-1], values[::-1], color="#246bfe")
    plt.xlabel("Importance")
    plt.title("Top Feature Importances")
    plt.tight_layout()
    plt.savefig(output_path, dpi=160)
    plt.close()


def save_actual_vs_predicted_plot(y_true: pd.Series, y_pred: np.ndarray, output_path: Path) -> None:
    plt.figure(figsize=(8, 8))
    plt.scatter(y_true, y_pred, alpha=0.25, s=10, color="#0f766e")
    min_value = min(float(np.min(y_true)), float(np.min(y_pred)))
    max_value = max(float(np.max(y_true)), float(np.max(y_pred)))
    plt.plot([min_value, max_value], [min_value, max_value], color="#dc2626", linewidth=2)
    plt.xlabel("Actual AQI")
    plt.ylabel("Predicted AQI")
    plt.title("Actual vs Predicted AQI")
    plt.tight_layout()
    plt.savefig(output_path, dpi=160)
    plt.close()


def save_residual_plot(y_true: pd.Series, y_pred: np.ndarray, output_path: Path) -> None:
    residuals = y_true.to_numpy() - y_pred
    plt.figure(figsize=(10, 6))
    plt.scatter(y_pred, residuals, alpha=0.25, s=10, color="#7c3aed")
    plt.axhline(0, color="#111827", linewidth=1.5)
    plt.xlabel("Predicted AQI")
    plt.ylabel("Residual")
    plt.title("Residual Plot")
    plt.tight_layout()
    plt.savefig(output_path, dpi=160)
    plt.close()


def save_evaluation_plots(
    model_pipeline: Any,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    raw_features: list[str],
    output_dir: Path,
) -> dict[str, str]:
    output_dir.mkdir(parents=True, exist_ok=True)
    predictions = model_pipeline.predict(X_test)

    paths = {
        "feature_importance": output_dir / "feature_importance.png",
        "actual_vs_predicted": output_dir / "actual_vs_predicted.png",
        "residual_plot": output_dir / "residual_plot.png",
    }
    save_feature_importance_plot(model_pipeline, raw_features, paths["feature_importance"])
    save_actual_vs_predicted_plot(y_test, predictions, paths["actual_vs_predicted"])
    save_residual_plot(y_test, predictions, paths["residual_plot"])
    return {name: str(path) for name, path in paths.items()}
