import Ai from "../models/ai";
import Dataset from "../models/dataset";
import Image from "../models/image";
import Label from "../models/label";
import Result from "../models/result";
import Tag from "../models/tag";
import User from "../models/user";


export async function dbSync(): Promise<void> {
    await Ai.sync({alter: true });
    await Dataset.sync({alter: true });
    await Image.sync({alter: true });
    await Label.sync({alter: true });
    await Result.sync({alter: true });
    await Tag.sync({alter: true });
    await User.sync({alter: true });
}

