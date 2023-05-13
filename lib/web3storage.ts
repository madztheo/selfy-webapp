import * as Name from 'w3name';
import {Web3Storage} from 'web3.storage';

const WEB3_STORAGE_API_KEY = process.env
    .WEB3_STORAGE_API_KEY as string;


/*
   Create first revision of data
   @param data: data to create
   @return name
 */
export async function createFirstData(url: any) {
    const name = await Name.create();
    const revision = await Name.v0(name, url);
    await Name.publish(revision, name.key);

    return name;
}

/*
   Update actual data
   @param nameKey: name key
   @param data: data to update
   @return revision
 */
async function updateData(nameKey: any, url: any) {
    const revision = await getLastRevision(nameKey);
    let nextRevision;

    if (null == revision.value) {
        throw new Error('No value found for name');
    } else {
        const name = Name.parse(nameKey);
        nextRevision = await Name.increment(revision, url);
        await Name.publish(nextRevision, name.key);
    }

    return nextRevision;
}

/*
    Get last revision of data for name
    @param nameKey: name key
    @return revision
 */
async function getLastRevision(nameKey: any) {
    const name = Name.parse(nameKey);
    const revision = await Name.resolve(name);

    return revision;
}

/*
  Let user to store files
    @param files: files to store
    @return cid
*/
async function storeFiles (filePath: any, fileName: any) {
    const client = makeStorageClient()
    const cid = await client.put([new File([filePath], fileName)]);
    console.log('stored files with cid:', cid)
    return cid
}

function makeStorageClient () {
    return new Web3Storage({ token: WEB3_STORAGE_API_KEY })
}