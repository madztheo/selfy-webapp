import Ethers from '../utils/ethers.service';
import {
  AuthenticateDocument,
  ChallengeDocument,
  ChallengeRequest,
  SignedAuthChallenge,
  Profile
} from '../utils/graphql/generated';

import { gql } from '@apollo/client'

export class ApolloLens {
    apolloClient: any;
    
    constructor(apolloClient: any) {
        this.apolloClient = apolloClient;
    }
    
    async generateChallenge (request: ChallengeRequest) {
        const result = await this.apolloClient.query({
            query: ChallengeDocument,
            variables: {
            request,
            },
        });

        return result.data.challenge;
    };

    async authenticate (request: SignedAuthChallenge) {
        const result = await this.apolloClient.mutate({
            mutation: AuthenticateDocument,
            variables: {
            request,
            },
        });

        return result.data!.authenticate;
    }

    async getProfile() {
        const query = `
            query Profile {
                profile(request: { handle: "selfyuser1.test" }) {
                    id
                    name
                    bio
                    attributes {
                    displayType
                    traitType
                    key
                    value
                    }
                    followNftAddress
                    metadata
                    isDefault
                    picture {
                    ... on NftImage {
                        contractAddress
                        tokenId
                        uri
                        verified
                    }
                    ... on MediaSet {
                        original {
                        url
                        mimeType
                        }
                    }
                    __typename
                    }
                    handle
                    coverPicture {
                    ... on NftImage {
                        contractAddress
                        tokenId
                        uri
                        verified
                    }
                    ... on MediaSet {
                        original {
                        url
                        mimeType
                        }
                    }
                    __typename
                    }
                    ownedBy
                    dispatcher {
                    address
                    canUseRelay
                    }
                    stats {
                    totalFollowers
                    totalFollowing
                    totalPosts
                    totalComments
                    totalMirrors
                    totalPublications
                    totalCollects
                    }
                    followModule {
                    ... on FeeFollowModuleSettings {
                        type
                        amount {
                        asset {
                            symbol
                            name
                            decimals
                            address
                        }
                        value
                        }
                        recipient
                    }
                    ... on ProfileFollowModuleSettings {
                        type
                    }
                    ... on RevertFollowModuleSettings {
                        type
                    }
                    }
                }
                }
        `;

        const result = await this.apolloClient.query({
            query: gql(query)
        });
        return result
    }


    async lensLogin() {
        const ethers = new Ethers();
        const address = await ethers.signer.getAddress();

        console.log('login: address', address);

        // we request a challenge from the server
        const challengeResponse = await this.generateChallenge({ address });

        // sign the text with the wallet
        const signature = await ethers.signText(challengeResponse.text);

        const authenticatedResult = await this.authenticate({ address, signature });
        console.log('login: result', authenticatedResult);

        return authenticatedResult;
    };
}
