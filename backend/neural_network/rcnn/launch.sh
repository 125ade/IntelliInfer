# avvia un contenitore Docker utilizzando l'immagine litcoderr/frcnn:latest, con alcune opzioni specifiche per l'uso di GPU.
cd ..
CUDA_VISIBLE_DEVICES='7'

#  --ipc=host condivide il namespace IPC con il sistema host, consentendo la comunicazione tra i processi all'interno del contenitore e quelli all'esterno.
docker run --gpus '"'device=$CUDA_VISIBLE_DEVICES'"' --ipc=host --rm -it \
    --mount src=$(pwd),dst=/faster-rcnn-inference,type=bind \
    --mount src=/media/data,dst=/data,type=bind \
    -e NVIDIA_VISIBLE_DEVICES=$CUDA_VISIBLE_DEVICES \
    -p 8888:8888 \
    -w /faster-rcnn-inference \
    litcoderr/frcnn:latest \
    bash -c "bash" \ 