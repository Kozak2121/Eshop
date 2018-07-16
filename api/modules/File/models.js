/* eslint-disable no-unused-vars */
import File from './schema-mongo';

export default class ModelClass {
  files() {
    return File.find(
      {},
      {},
      {
        sort: { id: -1 }
      }
    );
  }

  file(id) {
    return File.findOne({ id });
  }

  saveFiles(files) {
    return File.create(files);
  }

  deleteFile(id) {
    return File.remove({ id });
  }
}
