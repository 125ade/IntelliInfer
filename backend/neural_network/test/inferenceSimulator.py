import sys
import json
import os


def process_image(image_path):
    # Dummy function to simulate image processing
    # Replace this with actual processing logic
    result = {
        "error": None,
        "start": False,
        "finish": True
    }
    try:
        # Simulate processing
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
        image_path = os.path.join('/dataset', image['path'])
        result = process_image(image_path)

        # Update the corresponding result object
        for res in job_data['results']:
            if res['imageId'] == image['id']:
                res['data'].update(result)

    # Output the updated job data
    print(json.dumps(job_data))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py '<job_data>'")
        sys.exit(1)

    job_data = sys.argv[1]
    main(job_data)
