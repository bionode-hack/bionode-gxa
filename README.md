# bionode-gxa

Expression Atlas
----------------

Hompage: https://www.ebi.ac.uk/gxa/about.html

Steps to metadata
-----------------

1: How do I find the set of (human) datasets that are available?

Scrape the table webpage resulting from URL https://www.ebi.ac.uk/gxa/experiments/ (Note that this returns just the first 10 results by default with a Next button. Setting 'Show All entries' at the top of the table does not change the URL.)

Result file: https://github.com/bionode-hack/bionode-gxa/blob/master/example_responses/Experiment_EMBL-EBI.html

Update: The data table page https://www.ebi.ac.uk/gxa/experiments/ does an ajax request to https://www.ebi.ac.uk/gxa/json/experiments?_=1467206714961 to get the data (they seem to be using a JS data grid component). The underscore component seems to be some random hash to avoid http cache.

Filter out rows that do not have 'Homo sapiens' in the 'Organisms' column.

The 'Experiment' column field is a link of the form: 
https://www.ebi.ac.uk/gxa/experiments/E-GEOD-26284
with a text display such as 'RNA-seq of poly-A enriched total RNA of brain, liver, kidney, heart and skeletal muscle samples from frog'.

2: How do I request information on an individual dataset (or maybe a batch of datasets)?

Use each (filtered) row above as a dataset, extracting fields as follows in (3).

3: Where do I find the dataset attributes?

Accession number: Final part of the link in the Experiment field, e.g. 'E-GEOD-26284'

URL: The link in the Experiment field

Title: The text of the Experiment field

Description: Probably same as the Title

Technology: Use the display text of the 'Array Designs' field 

Assay type:


Update: An example JSON record is something like:

```json
    {
      "experimentType": "MICROARRAY_ANY",
      "experimentAccession": "E-GEOD-10070",
      "experimentDescription": "Gene Expression in MCF10A cells through Differentiation on Transwells",
      "lastUpdate": "03-07-2014",
      "numberOfAssays": 13,
      "numberOfContrasts": 3,
      "species": [
        "Homo sapiens"
      ],
      "kingdom": "animals",
      "ensemblDB": "ensembl",
      "experimentalFactors": [
        "phenotype"
      ],
      "arrayDesigns": [
        "A-AFFY-44"
      ],
      "arrayDesignNames": [
        "Affymetrix GeneChip Human Genome U133 Plus 2.0 [HG-U133_Plus_2]"
      ]
    },
```

