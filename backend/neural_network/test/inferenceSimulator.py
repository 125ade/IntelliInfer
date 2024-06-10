import sys
import json
import os
import random


def process_image(image_path):
    cla = 1
    con = 0.9
    x_center = 500
    y_center = 500
    width = 300
    height = 300
    result = {
        "error": None,
        "start": False,
        "finish": True,
        "box": [
            {
                "class_id": cla,
                "confidence": con,
                "x_center": x_center,
                "y_center": y_center,
                "width": width,
                "height": height
            }
        ]
    }
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        result["finish"] = True
    except Exception as e:
        result["error"] = str(e)
        result["finish"] = False
    return result


def main(job_data):
    job_data = json.loads(job_data)

    for image in job_data['images']:
        image_path = image['path']
        result = process_image(image_path)
        for res in job_data['results']:
            if res['imageId'] == image['id']:
                res['data'].update(result)

    print(json.dumps(job_data))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py '<job_data>'")
        sys.exit(1)

    job_data = sys.argv[1]
    main(job_data)
