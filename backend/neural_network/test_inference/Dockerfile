FROM python:alpine3.12

WORKDIR /app

COPY inferanceSimulator.py .
COPY requirements.txt .

RUN pip install -r requirements.txt

CMD ["python", "inferenceSimulator.py"]
