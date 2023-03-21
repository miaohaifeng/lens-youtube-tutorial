import { createClient } from 'urql'

const APIURL = "https://api.cyberconnect.dev/"

export const clientCyber = new createClient({
  url: APIURL
})

export const getProfilesCyber = `
query Accounts($address: AddressEVM!) {
  address(address: $address) {
    wallet {
      profiles {
        totalCount
        edges {
          node {
            id
            profileID
            handle
            metadata
            avatar
            isPrimary
          }
        }
      }
    }
  }
}
`