# `Ambr | v0.0.1`

## What is Ambr?

End-to-end encrypted file sharing app simultaneously providing a verifiable layer of protection to the user's intellectual property. A faster, more economical, far better way to share and protect the valuable ideas we wish to share.

Ambr Intro: [https://youtu.be/y13JmGI5uMU](https://youtu.be/y13JmGI5uMU)

Ambr User Demo: [https://youtu.be/917aLgHoLDs](https://youtu.be/917aLgHoLDs)

## Ambr's Story

Our ideas are incredibly valuable, but only if we can share these ideas with others in order to bring them to life. This, unfortunately, leaves us open to the risk of our valuable work being stolen[_1_]. My co-founder herself was inspired to create _Ambr_ for this very reason; when she experienced first-hand her own creative work being stolen at great cost.

Existing intellectual property protection services are too cumbersome and costly to be of practical use for the majority of individuals looking to protect their valuable work when sharing it with clients.

_Ambr_ lowers the bar of entry to equivalent protection, saves time and money by removing the need for trusted third parties, and is as easy to use as any existing file sharing app; integrating directly into existing workflows. What makes _Ambr_ unique and powerful is that no other file-sharing app simultaneously generates an immutable, independently verifiable fingerprint record of the file shared, on-chain, and assigned to the sharer’s private keys. So that in the unfortunate event, a client steals work, the creator now has indisputable, independently verifiable proof of the event, and the exact intellectual property that was involved—additionally with the ability to reveal who it was shared with.

_Ambr_ is built with absolute privacy and client confidentiality at its core and designed in line with our decentralisation design principles[_2_]. Every file shared via _Ambr_ is end-to-end encrypted, including the public on-chain token metadata, which can only be revealed with the unique key in each _Ambr_ link. _Ambr_ is specifically engineered, unlike other file sharing websites[_3_], so that nothing leaves the client-side unencrypted.

_Ambr_ perfectly combines the privacy of end-to-end encryption, with the public transparency and immutability of IPFS and the _Polygon_ ledger, harnessing it as power to those seeking a faster, cheaper and far better way to share and protect their ideas.

## How We Buidlt It

_Ambr_ is constructed from proprietary code and open-source libraries within a _React_ and _NextJS_ framework. In order to accommodate the time constraint, we’re utilising _Moralis_ for wallet authentication and backend, [mintfree.today](mintfree.today) for minting, and _Filecoin's IPFS_ for the data storage that requires persistence and censorship resistance. _Ambr_ was solely designed and built within a month by [Ash Beech](https://www.linkedin.com/in/web3/) and [Maria Kalavrezou](https://www.linkedin.com/in/maria-kalavrezou-design/).

## Ambr's Future

Our plans include working closely with lawyers and legal cases citing proof from _Ambr_ files, in an attempt to set precedence in court; helping fight for victims of stolen work. There are already exciting developments in this direction, especially as _UK_ courts recently recognised _NFTs_ as property[_4_, _5_, _6_].

The next goal for _Ambr_ is a beta release this year, there are many infrastructure elements we'll be working hard to make more robust and efficient beyond this _MVP_, as well as interface formatting improvements to be mobile-ready. We’re also keen to utilise the efficiency gains inherent in Polygon's _zkEVM_ as soon as possible. Further on the horizon, it's theoretically possible to have _Ambr_ become a fully decentralised _DApp_; an open-source protocol with a set of standards that anyone can build various interfaces for, this is something we'd love to make a reality.

## References

1. [The Drum Article: Pitches and Stolen Ritches](https://www.thedrum.com/news/2022/02/25/pitches-and-stolen-riches-ad-agencies-reveal-how-clients-have-ripped-them)

2. [Our Decentralisation Design Principles](https://github.com/thisisbullish/ddp)

3. [WeTransfer Is Not End-to-end Encrypted](<https://blog.cubbit.io/blog-posts/is-wetransfer-secure#:~:text=Wetransfer%20doesn't%20use%20end%2Dto%2Dend%20encryption.&text=you%20transfer%20documents%20or%20files,encryption%20(military%20grade%20encryption).>)

4. [NFTs recognised as property](https://cointelegraph.com/news/uk-court-recognizes-nfts-as-private-property-what-now)

5. [Legal documents to be served as NFT](https://coingeek.com/uk-court-allows-legal-documents-to-be-served-via-nfts/)

6. [U.S. copyright and trademark offices launch joint study on NFT impact on IP rights](https://coingeek.com/us-copyright-and-trademark-offices-launch-joint-study-on-nft-impact-on-ip-rights/)

## Todos ✅

- [ ] Enable direct email transfer of file links to recipient addresses.
- [ ] Move as much of the upload and minting process to server-side—w/o comprimising privacy—allowing users to close upload window sooner.
- [ ] Deploy custom Ambr.sol contract to mainnet.
- [ ] Much more exciting stuff [WIP]

---

© 2022 Ambr
