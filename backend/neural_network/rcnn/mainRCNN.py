from modelRCNN import Extractor

"""
Verifica se lo script viene eseguito direttamente come programma principale, e in tal caso esegue l'inferenza.
"""
if __name__ == "__main__":
    extractor = Extractor("./imagesRCNN", "./output")
    extractor.extract()