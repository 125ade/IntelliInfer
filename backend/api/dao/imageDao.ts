import { IDao } from './daoInterface';
import Image from '../models/image';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class ImageDao implements IDao<Image> {

    constructor() {}
    
    // creates a new Image instance given a series of metadata
    async create(imageJson: any): Promise<Image> {
        try{
            const data = await Image.create(imageJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // finds a specific Image given its id
    async findById(id: number): Promise<Image | ConcreteErrorCreator> {
        const image = await Image.findByPk(id);
        if(!image){
            throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
        }
        return image;
    }

    // finds all images of a dataset specified by its id
    async findAllImmagineByDatasetId(datasetId: number): Promise<Image[] | ConcreteErrorCreator> {

      const images: Image[] = await Image.findAll({
        where: {
          datasetId: datasetId
        }
      });
      if(images.length === 0){
          throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
      }

      return images;

  }

}