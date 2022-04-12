import ManifestHandler from '../../main/handlers/manifestHandler';
import Config from '../../main/models/config';
jest.mock('../../main/handlers/manifestHandler');

export const MockManifestHandler = () => new ManifestHandler({} as Config);
