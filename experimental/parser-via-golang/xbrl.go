package main

// TODO: xbrli:unit
// TODO: namespace us-gaap:
// TODO: namespace dei:
// TODO: cistom namespaces e.g.: appl:
// TODO: <link:schemaRef xlink:href="aapl-20180929.xsd" xlink:type="simple" />

type Document struct {
  Contexts []Context `xml:"context"`
  Units    []Unit    `xml:"xbrli unit"`
}

type Context struct {
  Id      string     `xml:"id,attr"`
  // Value   string     `xml:",chardata"`
  Entity  Entity     `xml:"entity"`
  Period  Period     `xml:"period"`
}

type Entity struct {
  Identifier string  `xml:"identifier,omitempty"`
  Segment    Segment `xml:"segment"`
}

type Segment struct {
  Members   []Member `xml:"explicitMember"`
}

type Member struct {
  Dimension  string  `xml:"dimension,attr"`
  Value      string  `xml:",chardata"`
}

type Period struct {
  Instant    string `xml:"instant,omitempty"`
  StartDate  string `xml:"startDate,omitempty"`
  EndDate    string `xml:"endDate,omitempty"`
}

type Unit struct {
  Id         string `xml:"id,attr"`
}