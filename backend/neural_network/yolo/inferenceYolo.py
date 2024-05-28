import os
import shutil
import random
import glob
import subprocess
import requests


# Define test and weights paths for INFERENCE
test_path = '/app/images'  
weight_path = '/app/weights/best.pt'  
output_path = '/app/output'  # volume
server_port = os.environ.get('SERVER_PORT')  # porta del server Node dall'ambiente
server_url = "http://backend:6777/save_images"  # URL del server Node

"""
Funzione che esegue l'inferenza su una singola immagine random all'interno del dataset disponibile.
"""
def run_inference(test_path, weight_path):
    # Lista dei file nell'elenco di test
    test_files = os.listdir(test_path)

    # Scegli un file a caso
    file_name = random.choice(test_files)
    image_path = os.path.join(test_path, file_name)

    # Comando di inferenza
    command = f"python yolov5/detect.py --weights {weight_path} --img 640 --conf 0.25 --source {image_path}"

    # Esegui il comando e cattura l'output
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

    # Controllo degli errori
    if process.returncode != 0:
        print(f"Errore durante l'inferenza: {stderr.decode('utf-8')}")
        return

    # Percorso dell'immagine inferita
    inference_dir = 'yolov5/runs/detect/exp'
    inferred_image_paths = glob.glob(os.path.join(inference_dir, '*.jpg'))

    # Copia delle immagini risultanti dall'inferenza nel volume
    if inferred_image_paths:
        # Copia tutte le immagini inferite nel volume Docker
        for inferred_image_path in inferred_image_paths:
            shutil.copy(inferred_image_path, output_path)

        # Nome dell'immagine inferita
        inferred_image_name = os.path.basename(inferred_image_paths[0])

        # Costruisci i dati dell'immagine da inviare
        image_info = {
            'image_name': inferred_image_name,
            'image_path': os.path.join(output_path, inferred_image_name)
        }

        # Invia i dati al server Node
        response = requests.post(server_url, json=image_info)

        if response.status_code == 200:
            print("Informazioni sull'immagine inviate con successo al server Node.")
        else:
            print(f"Errore nell'invio delle informazioni sull'immagine al server Node: {response.text}")


    else:
        print("Nessuna immagine inferita trovata.")

# Esegui l'inferenza e restituisci il risultato al server node
run_inference(test_path, weight_path)  