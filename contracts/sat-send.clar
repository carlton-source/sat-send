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

;; Number of tips a user has received
(define-map user-received-count principal uint)

;; Total amount of STX a user has sent
(define-map user-total-sent principal uint)

;; Total amount of STX a user has received
(define-map user-total-received principal uint)

;; ---------------------------------------------------------
;; Private Functions
;; ---------------------------------------------------------

;; calculate-fee
;; Calculates the SatSend platform fee based on the configured basis points
(define-private (calculate-fee (amount uint))
    (/ (* amount fee-basis-points) basis-points-divisor)
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; send-stx-tip
;;
;; Core function of the SatSend protocol.
;;
;; Allows a user to send a micro-tip in STX to another user along with
;; an optional message.
;;
;; Process:
;; 1. Validate the tip parameters
;; 2. Calculate the platform fee
;; 3. Transfer the net amount to the recipient
;; 4. Transfer the fee to the protocol owner
;; 5. Record the tip on-chain
;; 6. Update user statistics
;; 7. Update global protocol statistics
;;
;; The contract owner does not pay platform fees.

(define-public (send-stx-tip (recipient principal) (amount uint) (message (string-utf8 280)))
    (let
        (
            (tip-id (var-get total-tips-sent))
            (fee (calculate-fee amount))
            (is-owner (is-eq tx-sender contract-owner))
            (net-amount (if is-owner amount (- amount fee)))

            ;; Sender statistics
            (sender-sent (default-to u0 (map-get? user-total-sent tx-sender)))
            (sender-count (default-to u0 (map-get? user-tip-count tx-sender)))

            ;; Recipient statistics
            (recipient-received (default-to u0 (map-get? user-total-received recipient)))
            (recipient-count (default-to u0 (map-get? user-received-count recipient)))
        )

        ;; -------------------------------------------------
        ;; Validation Checks
        ;; -------------------------------------------------

        ;; Ensure the amount is greater than zero
        (asserts! (> amount u0) err-invalid-amount)

        ;; Prevent users from tipping themselves
        (asserts! (not (is-eq tx-sender recipient)) err-invalid-amount)

        ;; -------------------------------------------------
        ;; STX Transfers
        ;; -------------------------------------------------

        ;; Transfer the net amount to the recipient
        (try! (stx-transfer? net-amount tx-sender recipient))

        ;; Transfer the platform fee to the protocol owner
        ;; Skip if the sender is the contract owner
        (if is-owner
            true
            (try! (stx-transfer? fee tx-sender contract-owner))
        )

        ;; -------------------------------------------------
        ;; Record the Tip
        ;; -------------------------------------------------

        (map-set tips
            { tip-id: tip-id }
            {
                sender: tx-sender,
                recipient: recipient,
                amount: amount,
                message: message,
                tip-height: stacks-block-height
            }
        )

        ;; -------------------------------------------------
        ;; Update User Statistics
        ;; -------------------------------------------------

        (map-set user-total-sent tx-sender (+ sender-sent amount))
        (map-set user-total-received recipient (+ recipient-received amount))

        (map-set user-tip-count tx-sender (+ sender-count u1))
        (map-set user-received-count recipient (+ recipient-count u1))

        ;; -------------------------------------------------
        ;; Update Global Protocol Statistics
        ;; -------------------------------------------------

        (var-set total-tips-sent (+ tip-id u1))
        (var-set total-volume (+ (var-get total-volume) amount))
        (var-set platform-fees (+ (var-get platform-fees) fee))

        ;; Return the tip ID for reference
        (ok tip-id)
    )
)