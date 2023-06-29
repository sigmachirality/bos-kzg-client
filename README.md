# [Nounish (⌐◨-◨) KZG Client](https://ethglobal.com/showcase/nounish-kzg-client-xne1m)

# Project Description
Though one of the stated goals of the [KZG summoning ceremony](https://ceremony.ethereum.org/) is [client diversity](https://blog.ethereum.org/2022/12/15/kzg-ceremony-grants-round), as it stands there are only two contribution clients accessible through the browser (one of which is a [implementation themed around Doge](https://www.dogekzg.com/)). Additionally, the [IPFS hosted version](latest.kzgceremony.eth) of the EF's browser implementation is currently bugged! If something catastrophic were to happen to the EF's KZG frontend, the vast majority of users would lose the ability to meaningfully contribute to the KZG ceremony.

Additionally, I believe that more people would contribute if they could incorporate [more interesting sources of entropy](https://wiki.archlinux.org/title/Haveged) - wouldn't it be cool if people could say that their [favorite Noun](https://nouns.wtf) is playing a part in [securing](https://dankradfeist.de/ethereum/2020/06/16/kate-polynomial-commitments.html) the [future of EVM chains](https://www.eip4844.com/)? Or, we could incorporate non-EVM related sources of on-chain entropy, [like activity on NEAR](https://docs.near.org/bos/api/near) shards?

Hence, [Nounish KZG](https://near.org/spieler.near/widget/NounishKZG) is an alternate KZG summoning client implemented on [NEAR BOS](https://docs.near.org/bos). Because it is on NEAR BOS, Nounish KZG is [decentralized and resilient](https://docs.near.org/bos/overview#gateways) in a way that makes it unlikely to have downtime. Users can use Nounish KZG to generate entropy by building a Noun from [their favorite traits](https://docs.cloudnouns.com/cloud-api/parameter-reference), and the Noun is rolled into other sources of entropy and ultimately contributed to the KZG ceremony!

# How it's Made
The project consists of several [NEAR BOS widgets](https://docs.near.org/bos/components/widgets) composed together. These include:

- [NounishKZG](https://near.org/spieler.near/widget/NounishKZG)
  - [Splash](https://near.org#/near/widget/ComponentDetailsPage?src=spieler.near/widget/NounishKZG.Splash) - contains auth logic
  - [Lobby](https://near.org#/near/widget/ComponentDetailsPage?src=chirality.near/widget/NounishKZG.Lobby) - contains KZG math logic
- [NounSelector](https://near.org#/near/widget/ComponentDetailsPage?src=spieler.near/widget/NounSelector) - an extracted generalized Widget for generating Nouns

Of most technical note is the KZG math implementation. Nounish KZG depends on [noble-curves](https://github.com/paulmillr/noble-curves), using their pure TS/JS implementation of BLS. NEAR BOS [currently lacks support for WASM](https://github.com/NearDeFi/bos-viewer), so a pure TS/JS implementation was necessary - as a result, Nounish KZG trades off performance for decentralization in practice.

I believe this is probably one of the first examples of injecting a non-whitelisted library into the NEAR BOS VM. This was accomplished through an exploit/hack involving [iframes](https://docs.near.org/bos/tutorial/using-iframes), where the library was loaded into an iframe and then the iframe was called as a worker by the main app. As such, the library was able to run in the normal JS environment and scope in the iframe, while the surrounding app operated within the BOS VM. [Though there are security issues](https://owasp.org/www-community/attacks/Cross_Frame_Scripting), I believe this is an interesting workaround that could be investigated further as BOS works to extend support for 3rd-party packages!

Additionally, because NEAR BOS has easy access to the NEAR blockchain, I was able to use [the NEAR blockchain as another source of entropy](https://docs.near.org/bos/api/nearge). Though on-chain randomness has been thoroughly explored by orgs like [Geometry](https://geometry.xyz/notebook/mental-poker-in-the-age-of-snarks-part-1), [Paradigm](https://www.paradigm.xyz/2023/01/eth-rng) and [Chainlink](https://docs.chain.link/vrf/v2/introduction), I think this is still a novel usage of randomness cross-chains.



