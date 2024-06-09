import os
import random
import glob
import subprocess

# Define test and weights paths for INFERENCE
test_path = '/app/images'  
weight_path = '/app/weights/best.pt'  

"""
Funzione che esegue l'inferenza su una singola immagine random all'interno del dataset disponibile.
"""
def run_inference(test_path, weight_path):
    # Lista dei file nell'elenco di test
    test_files = os.listdir(test_path)

    # Sceglie un file a caso
    file_name = random.choice(test_files)
    image_path = os.path.join(test_path, file_name)

    # Comando di inferenza
    command = f"python yolov5/detect.py --weights {weight_path} --img 640 --conf 0.25 --source {image_path} --save-txt --save-conf"

    # Esegue il comando e cattura l'output
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

    # Controllo degli errori
    if process.returncode != 0:
        print(f"Errore durante l'inferenza: {stderr.decode('utf-8')}")
        print(f"Output dell'errore: {stderr.decode('utf-8')}")
        return None, None

    # Percorso dell'immagine inferita
    inference_dir = 'yolov5/runs/detect/exp'
    
    # Percorso dei file di output con le coordinate
    txt_files = glob.glob(os.path.join(inference_dir, 'labels', '*.txt'))

    # Estrai le informazioni dei bounding box dai file di testo
    bbox_data = []
    if txt_files:
        txt_file = txt_files[0]
        with open(txt_file, 'r') as f:
            for line in f:
                class_id, x_center, y_center, width, height, confidence = map(float, line.strip().split())
                bbox_data.append({
                    'class_id': class_id,
                    'x_center': x_center,
                    'y_center': y_center,
                    'width': width,
                    'height': height,
                    'confidence': confidence
                })
    else:
        print("Nessun file di testo trovato con le coordinate del bounding box.")
    
    return bbox_data, file_name

# Esegui l'inferenza
bbox_data, image_name = run_inference(test_path, weight_path)

# Salva le informazioni del bounding box su variabili
if bbox_data:
    for bbox in bbox_data:
        class_id = bbox['class_id']
        x_center = bbox['x_center']
        y_center = bbox['y_center']
        width = bbox['width']
        height = bbox['height']
        confidence = bbox['confidence']
        
        # Stampa i risultati per ogni bounding box
        print(f"Image Name: {image_name}")
        print(f"Class ID: {class_id}")
        print(f"X Center: {x_center}")
        print(f"Y Center: {y_center}")
        print(f"Width: {width}")
        print(f"Height: {height}")
        print(f"Confidence: {confidence}")
        print("\n")