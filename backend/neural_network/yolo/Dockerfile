FROM ultralytics/yolov5:latest

WORKDIR /app

COPY ./ .

# Clona la repository GitHub con la rete Yolo
RUN git clone https://github.com/ultralytics/yolov5.git

RUN mkdir yolov5
RUN cd yolov5
RUN pip install -r requirements.txt

CMD ["python", "inferenceYolo.py"]