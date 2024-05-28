import os
import cv2
import torch
import numpy as np
from pathlib import Path
from PIL import Image
from torchvision.transforms import ToTensor

"""
Il modulo torchvision.models.detection fa parte della libreria PyTorch Vision, che fornisce una serie di modelli pre-addestrati per
l'elaborazione delle immagini, inclusi modelli per rilevamento oggetti come Faster R-CNN.

fasterrcnn_resnet50_fpn: è una funzione che restituisce un'istanza di Faster R-CNN basata sull'architettura ResNet-50 e sulla regione di
interesse di Feature Pyramid Network (FPN).

FasterRCNN_ResNet50_FPN_Weights: è una classe che definisce una serie di costanti per specificare le impostazioni dei pesi pre-addestrati
per Faster R-CNN con architettura ResNet-50 e FPN.
"""
from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights

class Label():
    def __init__(self):
        self.fpath = Path("./labels.txt")
        self.data = self.get_data()
        
    def __call__(self, idx):
        return self.data[idx]
    
    def get_data(self):
        data = {}
        with open(self.fpath, "r") as f:
            for line in f:
                idx, name = tuple(line.split(": "))
                data[int(idx)] = name.split("\n")[0]
        return data

"""
Classe progettata per estrarre previsioni di oggetti da immagini utilizzando un modello di rilevamento di oggetti Faster R-CNN
e disegnare le caselle delimitatrici e le etichette sulle immagini
"""
class Extractor():
    def __init__(self, imgs_path, save_path):
        self.score_threshold = 0.3
        self.model = FRCNNModel.get_instance()
        self.label = Label()

        self.save_path = Path(save_path)

        self.img_names = os.listdir(imgs_path)
        self.img_paths = [Path(imgs_path) / name for name in self.img_names]
        self.img_tensors = [ToTensor()(Image.open(img_path)).to("cuda") for img_path in self.img_paths]
    
    """
    esegue l'estrazione delle previsioni dalle immagini utilizzando il modello e disegna le caselle delimitatrici e le etichette sull'immagine.
    """
    def extract(self):
        preds = self.model(self.img_tensors)

        np_images = self.tensors_to_npys()
        for pred, np_image, img_name in zip(preds, np_images, self.img_names):
            cv_img = np.transpose(np_image, (1, 2, 0)) * 255
            cv_img = cv2.cvtColor(cv_img, cv2.COLOR_RGB2BGR)

            boxes = pred['boxes'].cpu().detach().numpy()  # [n_boxes, 4 (x1, y1, x2, y2)]
            labels = pred['labels'].cpu().detach().numpy()  # [n_boxes]
            scores = pred['scores'].cpu().detach().numpy()  # [n_boxes]

            for box_i in range(boxes.shape[0]):
                x1, y1, x2, y2 = (int(coord) for coord in boxes[box_i])
                label = self.label(labels[box_i])
                score = scores[box_i]

                if score > self.score_threshold:
                    color = (255, 0, 0)
                    cv_img = cv2.rectangle(cv_img, (x1, y1), (x2, y2), color, 3)
                    cv_img = cv2.putText(cv_img, f'{label}', (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

            # write image
            cv2.imwrite(str(self.save_path / img_name), cv_img)
    
    """
    converte una lista di tensori PyTorch in una lista di array numpy
    """
    def tensors_to_npys(self):
        npy_list = []
        for tensor in self.img_tensors:
            npy = tensor.to("cpu").detach().numpy()
            npy_list.append(npy)
        return npy_list

"""
ingleton che fornisce un'istanza condivisa di un modello Faster R-CNN.
"""
class FRCNNModel:
    model = None

    def __init__(self):
        pass

    # decoratore che indica che il metodo seguente è un metodo di classe anziché un metodo di istanza.
    @classmethod
    # il parametro cls è una convenzione per fare riferimento alla classe stessa all'interno di un metodo di classe
    def get_instance(cls):
        if not cls.model:
            model = fasterrcnn_resnet50_fpn(weights=FasterRCNN_ResNet50_FPN_Weights.DEFAULT)
            #  Il modello viene spostato sulla GPU utilizzando il metodo to("cuda").
            model = model.to("cuda")
            # modello impostato in modalità di valutazione utilizzando il metodo eval().
            model.eval()
            cls.model = model
        return cls.model