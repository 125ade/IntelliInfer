FROM ultralytics/yolov5:latest

WORKDIR /app

COPY ./ .

RUN git clone https://github.com/ultralytics/yolov5.git

WORKDIR /app/yolov5

RUN pip install -r requirements.txt

WORKDIR /app

VOLUME /app/output

# Comando di default da eseguire quando il container viene avviato
CMD ["python", "inferenceYolo.py"]