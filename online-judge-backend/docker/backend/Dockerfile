FROM python:3.10-slim

WORKDIR /src

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /src/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /src/requirements.txt

COPY ./app /src/app
COPY .env /src/.env

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]