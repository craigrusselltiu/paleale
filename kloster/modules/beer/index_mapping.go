package beer

import (
	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/analysis/analyzer/keyword"
	"github.com/blevesearch/bleve/analysis/lang/en"
	"github.com/blevesearch/bleve/mapping"
)

func buildIndexMapping() mapping.IndexMapping {
	englishTextFieldMapping := bleve.NewTextFieldMapping()
	englishTextFieldMapping.Analyzer = en.AnalyzerName

	keywordFieldMapping := bleve.NewTextFieldMapping()
	keywordFieldMapping.Analyzer = keyword.Name

	beerMapping := bleve.NewDocumentMapping()

	beerMapping.AddFieldMappingsAt("name", englishTextFieldMapping)
	beerMapping.AddFieldMappingsAt("description", englishTextFieldMapping)
	beerMapping.AddFieldMappingsAt("beerStyle", englishTextFieldMapping)

	indexMapping := bleve.NewIndexMapping()
	indexMapping.AddDocumentMapping("beer", beerMapping)

	indexMapping.TypeField = "style"
	indexMapping.DefaultAnalyzer = "en"

	return indexMapping
}
