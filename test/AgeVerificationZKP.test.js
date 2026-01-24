const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgeVerificationZKP", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    const AgeVerificationZKP = await ethers.getContractFactory(
      "AgeVerificationZKP"
    );
    contract = await AgeVerificationZKP.deploy();
    await contract.waitForDeployment();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy and set owner", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("Owner should be a verifier by default", async function () {
      const verifiers = await contract.verifiers(owner.address);
      expect(verifiers).to.be.true;
    });

    it("Contract should not be paused", async function () {
      const paused = await contract.paused();
      expect(paused).to.be.false;
    });
  });

  describe("Proof Submission", function () {
    it("Should submit a proof successfully", async function () {
      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await contract.connect(addr1).submitProof(
        commitment,
        hashedAge,
        minAge,
        timestamp,
        proofSignature
      );

      const proofs = await contract.getUserProofs(addr1.address);
      expect(proofs.length).to.equal(1);
      expect(proofs[0].commitment).to.equal(commitment);
      expect(proofs[0].minAge).to.equal(minAge);
    });

    it("Should emit ProofSubmitted event", async function () {
      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await expect(
        contract.connect(addr1).submitProof(
          commitment,
          hashedAge,
          minAge,
          timestamp,
          proofSignature
        )
      )
        .to.emit(contract, "ProofSubmitted")
        .withArgs(addr1.address, commitment, minAge, timestamp);
    });

    it("Should reject invalid commitment", async function () {
      const commitment = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await expect(
        contract.connect(addr1).submitProof(
          commitment,
          hashedAge,
          minAge,
          timestamp,
          proofSignature
        )
      ).to.be.revertedWith("Invalid commitment");
    });

    it("Should reject invalid age", async function () {
      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 0;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await expect(
        contract.connect(addr1).submitProof(
          commitment,
          hashedAge,
          minAge,
          timestamp,
          proofSignature
        )
      ).to.be.revertedWith("Invalid age requirement");
    });

    it("Should reject future timestamp", async function () {
      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const proofSignature =
        "0x" + "3".repeat(64);

      await expect(
        contract.connect(addr1).submitProof(
          commitment,
          hashedAge,
          minAge,
          futureTimestamp,
          proofSignature
        )
      ).to.be.revertedWith("Invalid timestamp");
    });
  });

  describe("Proof Verification", function () {
    beforeEach(async function () {
      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await contract.connect(addr1).submitProof(
        commitment,
        hashedAge,
        minAge,
        timestamp,
        proofSignature
      );
    });

    it("Should verify a proof", async function () {
      await contract.connect(owner).verifyProof(addr1.address, 0);

      const proofs = await contract.getUserProofs(addr1.address);
      expect(proofs[0].verified).to.be.true;
    });

    it("Should mark user as verified", async function () {
      await contract.connect(owner).verifyProof(addr1.address, 0);

      const isVerified = await contract.verifiedUsers(addr1.address);
      expect(isVerified).to.be.true;
    });

    it("Should set user min age verified", async function () {
      await contract.connect(owner).verifyProof(addr1.address, 0);

      const minAgeVerified = await contract.userMinAgeVerified(addr1.address);
      expect(minAgeVerified).to.equal(18);
    });

    it("Should emit ProofVerified event", async function () {
      const proofs = await contract.getUserProofs(addr1.address);

      await expect(contract.connect(owner).verifyProof(addr1.address, 0))
        .to.emit(contract, "ProofVerified")
        .withArgs(addr1.address, proofs[0].commitment, proofs[0].timestamp);
    });

    it("Non-verifier cannot verify proofs", async function () {
      await expect(
        contract.connect(addr2).verifyProof(addr1.address, 0)
      ).to.be.revertedWith("Only verifier can call this");
    });

    it("Cannot verify already verified proof", async function () {
      await contract.connect(owner).verifyProof(addr1.address, 0);

      await expect(
        contract.connect(owner).verifyProof(addr1.address, 0)
      ).to.be.revertedWith("Proof already verified");
    });
  });

  describe("User Verification Status", function () {
    beforeEach(async function () {
      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await contract.connect(addr1).submitProof(
        commitment,
        hashedAge,
        minAge,
        timestamp,
        proofSignature
      );
    });

    it("Should check user verification status", async function () {
      await contract.connect(owner).verifyProof(addr1.address, 0);

      const [hasValidProof, minAgeVerified] = await contract.isUserVerified(
        addr1.address
      );
      expect(hasValidProof).to.be.true;
      expect(minAgeVerified).to.equal(18);
    });

    it("Should verify user for specific age", async function () {
      await contract.connect(owner).verifyProof(addr1.address, 0);

      const isVerifiedFor18 = await contract.isUserVerifiedForAge(
        addr1.address,
        18
      );
      expect(isVerifiedFor18).to.be.true;

      const isVerifiedFor21 = await contract.isUserVerifiedForAge(
        addr1.address,
        21
      );
      expect(isVerifiedFor21).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should add verifier", async function () {
      expect(await contract.verifiers(addr1.address)).to.be.false;

      await contract.connect(owner).addVerifier(addr1.address);

      expect(await contract.verifiers(addr1.address)).to.be.true;
    });

    it("Should remove verifier", async function () {
      await contract.connect(owner).addVerifier(addr1.address);
      expect(await contract.verifiers(addr1.address)).to.be.true;

      await contract.connect(owner).removeVerifier(addr1.address);

      expect(await contract.verifiers(addr1.address)).to.be.false;
    });

    it("Should pause contract", async function () {
      expect(await contract.paused()).to.be.false;

      await contract.connect(owner).pause();

      expect(await contract.paused()).to.be.true;
    });

    it("Should unpause contract", async function () {
      await contract.connect(owner).pause();
      await contract.connect(owner).unpause();

      expect(await contract.paused()).to.be.false;
    });

    it("Non-owner cannot call admin functions", async function () {
      await expect(
        contract.connect(addr1).addVerifier(addr2.address)
      ).to.be.revertedWith("Only owner can call this");

      await expect(
        contract.connect(addr1).pause()
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should set proof expiration time", async function () {
      const newExpiration = 30 * 24 * 60 * 60; // 30 days

      await contract.connect(owner).setProofExpirationTime(newExpiration);

      const proofExpirationTime = await contract.proofExpirationTime();
      expect(proofExpirationTime).to.equal(newExpiration);
    });
  });

  describe("Pause Functionality", function () {
    it("Should not allow proof submission when paused", async function () {
      await contract.connect(owner).pause();

      const commitment =
        "0x" + "1".repeat(64);
      const hashedAge =
        "0x" + "2".repeat(64);
      const minAge = 18;
      const timestamp = Math.floor(Date.now() / 1000);
      const proofSignature =
        "0x" + "3".repeat(64);

      await expect(
        contract.connect(addr1).submitProof(
          commitment,
          hashedAge,
          minAge,
          timestamp,
          proofSignature
        )
      ).to.be.revertedWith("Contract is paused");
    });
  });
});
