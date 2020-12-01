# External-Metadata-Interface-Builder
This Interface connects builder with external metadata of different clients and transform that data in builder format for the ease of use.

### High Level Design Of External Metadata Integration Module
##### Module Selection Logic
* This module sits in the External metadata integration layer and decides which module’s conversion logic to execute. This decision is taken based on the Conversion key (client id).

* It also returns the converted data to the web application.

##### Client Modules
* These modules are the one which abstracts the External Metadata Library from the builder. 

* This module encapsulates the following of External Metadata library communication configuration Data schema

### Low Level Design Of External Metadata Integration Module
##### Folder Structure 

```
index.js
metadata
 └── cup
     └── index.js
     |	 lib
     |    └── communication/conversion logic files
     |      
     |      
     |      
     vhl
      |__ index.js
          lib
           └── communication/conversion logic files
test
 |__ test.js
             
```
##### Functions exposed by this module
###### Currently this module exposes two functions
* **getMetadata** -
	* return docs collection or categoryMap when resolved corresponding to clientId.
	* Signature
		* getExternalMetadata(config, docs)
	* Parameters
		* config : configuration options for the external module i.e. api url and key
		* docs : true/false This boolean decides if this function returns categoryMap or metadata docs in a 				flat hierarchy. 
	* Returns
		* return docs collection or categoryMap

* **getTagDetails** - 
	* returns tag details from the client corresponding to tagId.
	* Signature
		* getTagDetails(config, id)
	* Parameters
		* config : configuration options for the external module i.e. api url and key
		* id : id of tag corresponding to the client library
	* Returns
		* return tags detail

### Steps to create a new Client Module inside this layer
* Create a folder inside the metadata folder with the conversion key as folder name.
* Create an index.js file at the root of your folder created in the above step.
* This index.js file should expose two functions 
	* getMetadata
		* Signature - getMetadata(options, config)
		* Parameters - 
			* options : inputs required for the fetch metadata for example: taxonomy list 
			* config : config passed to the module. 
	* getTagDetails
		* Signature - getTagDetails(id, config)
		* Parameters - 
			* id : id to fetch tag details for 
			* config : config passed to the module. 
* Import your client module in the index.js file present at the root location of this module.
* Put reference of your client vs your conversion key in organization map present in Index.js
* Extract your inputs from builder-mapping node and place this mapping in fetchGetMetadataParameters function in index.js file.
* Optional - You can pass docs = true , false in step 6 to your client module if your client supports returning flat metadata docs

### Selection Logic
* When the library receives a getMetadata/getTagDetails request
* It extracts the conversion key (id) from the config passed into these functions.
* Then the external module calls getClientModule function which returns a reference of the client module based on the conversion key passed.
* The getClientModule looks up for a module reference of client in organizationMap which is hardcoded in the index.js file.
* The reference of the client should be updated in organizationMap for every new client.

