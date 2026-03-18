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
(define-constant err-invalid-amount (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-transfer-failed (err u103))
(define-constant err-not-found (err u104))

;; ---------------------------------------------------------
;; Fee Configuration
;; ---------------------------------------------------------

;; Platform fee configuration using basis points
;; 50 basis points = 0.5% fee
(define-constant fee-basis-points u50)
(define-constant basis-points-divisor u10000)

;; ---------------------------------------------------------
;; Global Protocol Statistics
;; ---------------------------------------------------------

;; Total number of tips sent through SatSend
(define-data-var total-tips-sent uint u0)

;; Total volume of STX tipped across the platform
(define-data-var total-volume uint u0)

;; Total platform fees accumulated by the protocol
(define-data-var platform-fees uint u0)

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Tip registry
;; Stores every tip sent through the SatSend protocol
(define-map tips
    { tip-id: uint }
    {
        sender: principal,
        recipient: principal,
        amount: uint,
        message: (string-utf8 280),
        tip-height: uint
    }
)

;; ---------------------------------------------------------
;; User Activity Tracking
;; ---------------------------------------------------------

;; Number of tips a user has sent
(define-map user-tip-count principal uint)