FROM nvcr.io/nvidia/pytorch:22.09-py3

# Imposta un argomento di costruzione per evitare che gli script di installazione interattivi richiedano input dall'utente
ARG DEBIAN_FRONTEND=noninteractive

ENV TZ=Europe

# Aggiorna l'elenco dei pacchetti disponibili.
RUN apt-get -y update

# Installa il pacchetto tzdata per gestire le informazioni sul fuso orario.
RUN apt-get install -y tzdata

#  Installa il gestore di finestre tmux.
RUN apt install -y tmux

# Installa l'utilità htop per monitorare l'utilizzo della CPU
RUN apt install -y htop

# Installa l'utilità ncdu per analizzare l'uso del disco
RUN apt install -y ncdu

COPY requirements.txt ./

# Installa le dipendenze e poi rimuove il file requirements.txt.
RUN pip install -r requirements.txt && rm ./requirements.txt

WORKDIR /faster-rcnn-inference
