

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { client, recommendProfiles, getPublications, searchProfiles } from '../api'
import { clientCyber, getProfilesCyber } from '../cyberapi'
const addressList = require("../json/100address.json");


function parseImageUrl(url) {
  if (url && /^ipfs/.test(url)) {
    url = url.replace(/^ipfs:\/\//, 'https:\/\/ipfs.io/ipfs/')
  }
  return url
}

export default function Home() {
  const [profiles, setProfiles] = useState([])
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      const response = await client.query(recommendProfiles).toPromise()
      const profileData = await Promise.all(response.data.recommendedProfiles.map(async profile => {
        const pub = await client.query(getPublications, { id: profile.id, limit: 1 }).toPromise()
        profile.publication = pub.data.publications.items[0]
        return profile
      }))
      setProfiles(profileData)
    } catch (err) {
      console.log('error fetching recommended profiles: ', err)
    }
  }

  async function fetchCyberProfiles() {

    try {
      for (const ad of addressList) {
        const response = await clientCyber.query(getProfilesCyber, { address: ad.address }).toPromise()
        const cybernode = response.data.address.wallet.profiles.edges[0].node;
        ad.cybernode = cybernode;
        // console.log(cybernode);
      }
      console.log("addressList:",addressList);
      // fs.writeFileSync('write.txt',addressList);
    } catch (err) {
      console.log('error fetching recommended profiles: ', err)
    }
  }

  async function searchForProfile() {
    try {
      const response = await client.query(searchProfiles, {
        query: searchString, type: 'PROFILE'
      }).toPromise()
      const profileData = await Promise.all(response.data.search.items.map(async profile => {
        const pub = await client.query(getPublications, { id: profile.profileId, limit: 1 }).toPromise()
        profile.id = profile.profileId
        profile.publication = pub.data.publications.items[0]
        return profile
      }))

      setProfiles(profileData)
    } catch (err) {
      console.log('error searching profiles...', err)
    }
  }

  console.log({ profiles })

  return (
    <div>
      <div>
        <button
          onClick={fetchCyberProfiles}
        >SEARCH PROFILES Cyber</button>
      </div>
      <div>
        <input
          placeholder='Search'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
        />
        <button
          onClick={searchForProfile}
        >SEARCH PROFILES</button>babyla.lens
        <div>
          {
            profiles.map((profile, index) => (
              <Link href={`/profile/${profile.id}`} key={index}>
                <a>
                  {
                    profile.picture ? (
                      <img src={parseImageUrl(profile.picture?.original?.url)}
                        width="52px"
                        height="52px" />
                    ) : <div style={blankPhotoStyle} />
                  }
                  <p>{profile.handle}</p>
                  <p >{profile.publication?.metadata.content}</p>
                </a>
              </Link>
            ))
          }
        </div>
      </div>

    </div>
  )
}

const blankPhotoStyle = {
  width: '52px',
  height: '52px',
  backgroundColor: 'black'
}