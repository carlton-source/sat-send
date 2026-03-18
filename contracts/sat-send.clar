;; SatSend - Micro-tipping protocol on Stacks
;; Version: 1.0.0
;;
;; SatSend is a decentralized micro-tipping protocol built on the Stacks blockchain.
;; It enables users to send STX tips with optional messages to creators, developers,
;; and contributors. The contract records tipping activity, tracks user statistics,
;; and collects a small platform fee to support protocol sustainability.
;;
;; SatSend provides transparent on-chain metrics such as:
;; - Total tips sent across the protocol
;; - Total transaction volume
;; - User tipping statistics
;; - Platform fee accumulation
;;
;; The goal of SatSend is to create a simple and transparent way to
;; support creators and contributors using micro-payments secured by Bitcoin.

;; ---------------------------------------------------------
;; Constants
;; ---------------------------------------------------------

;; The principal that deploys the contract becomes the protocol owner
(define-constant contract-owner tx-sender)

;; Error codes for predictable failure handling
(define-constant err-owner-only (err u100))