        CIP: 
        Title: Subassets
        Author: Joe Looney (loon3)
        Status: Draft
        Type: Standards Track
        Created: 2016-01-29


# Abstract

Establishes a protocol for issuing subassets 

(_ex._ `SEED.TOMATO`, `SEED.LETTUCE`, `SEED.CUCUMBER`, `SEED.TOMATO.PLUM`)



# Motivation

To enable named asset owners the ability and flexibility to issue new easily identified and related named assets.



# Definitions

subasset

        An asset, with its name defined by a parent asset, that masks a defined reference asset (SEED.TOMATO is a subasset of SEED)

parent asset
    
        The named or numeric asset from which a subasset is derived (SEED is the parent asset of SEED.TOMATO)
    
child name

        An additional name appended to a parent asset to create a subasset (TOMATO is the child name in SEED.TOMATO)
    
reference asset

        A numeric asset defined and recognized as a subasset 



# Overview

*   For consistency, child names must meet the same requirements as standard non-numeric Counterparty assets with the following exceptions:
    *   1 to 12 characters in length (ie. SEED.X or SEED.BERMUDAGRASS)
    *   May start with the letter A (ie. SEED.A)
    *   May contain numbers (ie. SEED.1)


*   Does not require any changes to counterparty-lib for initial implementation, but can be implemented in the future without any changes to the procedure with all issued subassets remaining valid.  Some effects of implementing in counterparty-lib may include...
    *   Issuance txs with descriptions containing subasset parameters do not result in a change in the description (similar to locking an asset issuance), instead they are parsed, validated, and stored separately in the counterparty-lib db
    *   Standardization and accessibility for developers is increased with the availability of counterparty-lib and/or counterblock API calls


*   Subassets have the following characteristics...

    *   Child name is defined by the parent only.  
    *   Can be issued from a different address than the parent.
    *   Inalterable by both the parent asset and subasset owner
    *   Limited to one or two levels only (ie. SEED.TOMATO and SEED.TOMATO.CHERRY)
    *   Top level parent asset (ie. SEED) has the option to prohibit subassets from issuing a second level subasset (ie. SEED.TOMATO is prohibited by SEED from issuing SEED.TOMATO.CHERRY) 



# Specification

## Issuance

*   Requires two issuance type transactions:

    1.  Issue Numeric Asset (reference asset) with parent asset parameter defined in the description (defined below as __Issue Child__) 
    2.  Parent asset description change, append to existing description the reference asset and reference asset child name parameters (defined below as __Register Child with Parent__)
    
    
*   Maximum asset description length for issuance txs is 38 characters, keeping it under the 41 byte threshold for using an 80 byte OP_RETURN output (cost limited to bitcoin tx fee per issaunce tx)


### Issue Child 


Issuance type tx -> New Numeric Asset (reference asset) with parent asset information encoded in the description

___Reference Asset:___ 

        A18072092996280810000
        
    
___Description:___
    
Key/values must be stored as ASCII text characters to be parsed by counterparty-lib
        
        (hex) 3b3b7053454544 (7 bytes, variable from 7 to 24 bytes)
        (text) ;;pSEED

Summary

        3b3b                
            double semi-colon delimiter (;;) 
            
        70                  
            parent asset key (p)
            
        53454544            
            parent asset value (SEED)
        
        
### Register Child with Parent


Issuance type tx -> Parent Asset description change, replace existing description with reference asset and child name

(_Optional_: lock child issuance parameter prohibits subasset owner from issuing a second level subasset, i.e. SEED.TOMATO.CHERRY)

___Parent Asset:___

        SEED
        
    
___Description:___
    
Key/values must be stored as ASCII text characters to be parsed by counterparty-lib
        
Existing Description + 

        (hex) 3b3b7241313830373230393239393632383038313030303063544f4d41544f78 
        (31 bytes, variable from 29 to 38 bytes)

        (text) ;;rA18072092996280810000cTOMATOx
        
Summary
        
        3b3b                                                
            double semi-colon delimiter (;;), marks start of key/value parameters 
        
        72                                                  
            reference asset key (r)
        
        413138303732303932393936323830383130303030          
            reference asset value (A18072092996280810000)
        
        63                                                  
            child name key (c)
        
        544f4d41544f                                        
            reference asset child name value (TOMATO)
            
        78
            lock child issuance (x) (optional) 
            


## Subasset Parsing

*   To prevent parent and subasset owners from changing the parent/child/reference asset parameters in the asset description after issuance, clients should always parse all issuance txs for reference and parent assets and use the oldest relevant tx.  This is important to prevent changes as well as prevent the use of duplicate subasset names.  Client software should confirm both the oldest reference asset and child asset name.


*   Once a subasset is found, it can be stored locally for quick reference since a subasset cannot be unlinked from a parent.


*   To properly display a reference asset as a subasset in the client, the following steps are required...

    1.   API call to get all numeric assets found at an address
    2.   Parse the issuance txs for each numeric asset to find any existing parent asset values
    3.   If parent asset values are found, use an API call to get and parse all issuance txs for each found parent asset
    4.   Find the earliest issuance tx with a description that contains the reference asset value matching the numeric asset in Step 1, then find the corresponding child asset key and display asset in wallet as `PARENT.CHILD`
    5.   If the description in Step 4 has a parent asset parameter in its description (indicating it is also a subasset) then iterate Steps 3-5 and display full asset name in wallet (unless the lock child issuance parameter is declared)
    

    
# Implementation

https://github.com/loon3/XCP-Wallet/blob/master/Chrome-Extension/js/xcp-js/subassets.js
