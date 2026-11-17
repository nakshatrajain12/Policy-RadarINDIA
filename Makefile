.PHONY: dev test pipeline seed clean help

PYTHON ?= python
UVICORN ?= uvicorn
PYTEST ?= pytest

help:
	@echo "Available targets:"
	@echo "  make dev       - Start FastAPI development server"
	@echo "  make test      - Run pytest test suite"
	@echo "  make pipeline  - Run Bronze -> Silver -> NLP pipeline"
	@echo "  make seed      - Ingest central schemes database"

dev:
	$(UVICORN) main:app --reload --host 127.0.0.1 --port 8000

test:
	$(PYTEST) tests/ -v

pipeline:
	$(PYTHON) pipeline/bronze_runner.py
	$(PYTHON) pipeline/silver.py
	$(PYTHON) pipeline/nlp_enrichment.py
	$(PYTHON) pipeline/change_detection.py

seed:
	$(PYTHON) pipeline/ingest_central_xlsx.py

clean:
	-rm -rf __pycache__ .pytest_cache .qodo
