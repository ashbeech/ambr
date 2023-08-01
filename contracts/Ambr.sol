// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*********************************************************************

          ▄                             ▄▄
          ▀▓▓                           ▓▓
         ▀  ▓▓      ▓▓▄   ▀▓▄   ▄▀▀▓▄   ▓▓▄▄▄▄▀▀▓▓▄    ▀▌▄▀▀▀▀▓▓▄
       ▄▀   ▓▓▓     ▓▓      ▓▓     ▐▓▌  ▓▓        ▀▓▓▄  ▓▌
      ▄   ▄▓▓▀▓▌    ▓▓      ▐▓      ▓▌  ▓▓          ▓▓  ▓▌
     ▀  ▄▓▀    ▓▌   ▓▓      ▐▓      ▓▌  ▓▓          ▓▓  ▓▌
    ▐▄▄▓▀      ▐▓▌  ▓▓      ▐▓      ▓▌  ▓▓█▄▄  ▄▄▄▓▀    ▓▌

    Share ideas worth protecting.

*********************************************************************/

contract Ambr is ERC721URIStorage, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    address public admin;
    address public distributor;
    mapping(uint256 => bytes20) public fingerprints;

    using Counters for Counters.Counter;
    Counters.Counter private ids;

    constructor() ERC721("Ambr", "AMBR") {
        admin = msg.sender;

        _setupRole(ADMIN_ROLE, admin);
        _setRoleAdmin(DISTRIBUTOR_ROLE, ADMIN_ROLE);
    }

    //function issue(address to, string memory link)
    function issue(
        address to,
        string memory link,
        bytes20 hash
    ) public onlyRole(DISTRIBUTOR_ROLE) {
        ids.increment();
        uint256 id = ids.current();
        _mint(to, id);
        _setTokenURI(id, link);
        fingerprints[id] = hash;
    }

    function getFingerprint(uint256 tokenId) public view returns (bytes20) {
        require(_exists(tokenId), "Ambr: token does not exist");
        return fingerprints[tokenId];
    }

    function burn(uint256 tokenId) public {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "Ambr: caller is not owner nor approved"
        );

        _burn(tokenId);
        delete fingerprints[tokenId];
    }

    function setAdmin(address newAdmin) public onlyRole(ADMIN_ROLE) {
        admin = newAdmin;
    }

    function setDistributor(
        address newDistributor
    ) public onlyRole(ADMIN_ROLE) {
        distributor = newDistributor;
        grantRole(DISTRIBUTOR_ROLE, distributor);
    }

    function revokeDistributor() public onlyRole(ADMIN_ROLE) {
        revokeRole(DISTRIBUTOR_ROLE, distributor);
        distributor = address(0);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
