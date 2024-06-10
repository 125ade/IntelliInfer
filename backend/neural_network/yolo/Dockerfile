FROM ultralytics/yolov5:latest

WORKDIR /app

COPY ./ .

RUN git clone https://github.com/ultralytics/yolov5.git

WORKDIR /app/yolov5

RUN pip install -r requirements.txt

WORKDIR /app

