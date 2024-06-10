import sys
import json
import os
import random
import glob
import subprocess


def process_image(image_path, weight_path):
    result = {
        "error": None,
        "start": False,
        "finish": False,
        "box": []
    }
    
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Esegui l'inferenza
        command = f"python yolov5/detect.py --weights {weight_path} --img 640 --conf 0.25 --source {image_path} --save-txt --save-conf"
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            raise Exception(stderr.decode('utf-8'))

        # Percorso dell'immagine inferita
        inference_dir = 'yolov5/runs/detect/exp'
        # Percorso dei file di output con le coordinate
        txt_files = glob.glob(os.path.join(inference_dir, 'labels', '*.txt'))

        # Estrai le informazioni dei bounding box dai file di testo
        if txt_files:
            txt_file = txt_files[0]
            with open(txt_file, 'r') as f:
                for line in f:
                    class_id, x_center, y_center, width, height, confidence = map(float, line.strip().split())
                    result["box"].append({
                        'class_id': int(class_id),
                        'confidence': confidence,
                        'x_center': x_center,
                        'y_center': y_center,
                        'width': width,
                        'height': height
                    })
            result["finish"] = True
        else:
            raise Exception("No bounding box files found.")
        
    except Exception as e:
        result["error"] = str(e)
        result["finish"] = False
    
    return result


def main(job_data, weight_path):
    job_data = json.loads(job_data)

    for image in job_data['images']:
        image_path = image['path']
        result = process_image(image_path, weight_path)
        for res in job_data['results']:
            if res['imageId'] == image['id']:
                res['data'].update(result)

    print(json.dumps(job_data))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py '<job_data>' '<weight_path>'")
        sys.exit(1)

    job_data = sys.argv[1]
    weight_path = sys.argv[2]
    main(job_data, weight_path)


