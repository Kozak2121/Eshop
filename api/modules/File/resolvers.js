/* eslint-disable no-unused-vars */
import shell from 'shelljs';

export default pubsub => ({
  Query: {
    files(obj, args, { File }) {
      return File.files();
    }
  },
  Mutation: {
    uploadFiles: async (obj, { files }, { File }) =>
      await File.saveFiles(files),
    removeFile: async (obj, { id }, { File }) => {
      const file = await File.file(id);
      if (!file) {
        throw new Error('File not found.');
      }

      const ok = await File.deleteFile(id);
      if (ok) {
        const filePath = `${file.path}`;
        const res = shell.rm(filePath);
        if (res.code > 0) {
          throw new Error('Unable to delete file.');
        }
      }
      return ok;
    }
  },
  Subscription: {}
});
