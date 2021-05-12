package main

import (
  "encoding/xml"
  "golang.org/x/text/encoding/ianaindex"
  "fmt"
  "io"
  "io/ioutil"
  "os"
)

// TODO: xbrli:unit
// TODO: namespace us-gaap:
// TODO: namespace dei:
// TODO: cistom namespaces e.g.: appl:
// TODO: <link:schemaRef xlink:href="aapl-20180929.xsd" xlink:type="simple" />

type Data struct {
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

func main() {
  data := parseXbrlByDecoder("./../../resources/stocks/AAPL/files/10-K_2018-11-05.xml");
  
  fmt.Println("Contexts length: ", len(data.Contexts))
  
  for i := 0; i < len(data.Contexts); i++ {
    fmt.Println("Context Id: " + data.Contexts[i].Id)
    
    fmt.Println("Context Entity.Identifier: "   + data.Contexts[i].Entity.Identifier)
    
    if(len(data.Contexts[i].Entity.Segment.Members) > 0) {
      fmt.Println("Context Entity.Dimension: "    + data.Contexts[i].Entity.Segment.Members[0].Dimension)
      fmt.Println("Context Entity.Value: "        + data.Contexts[i].Entity.Segment.Members[0].Value)
    }

    fmt.Println("Context Period.Instant: "   + data.Contexts[i].Period.Instant)
    fmt.Println("Context Period.StartDate: " + data.Contexts[i].Period.StartDate)
    fmt.Println("Context Period.EndDate: "   + data.Contexts[i].Period.EndDate)
  }
}

func parseXbrl(filepath string) Data {
  file, err := os.Open(filepath)

  if err != nil {
    fmt.Println(err)
  }

  defer file.Close()
  
  var data Data
  
  byteValue, err := ioutil.ReadAll(file)
  if err != nil {
    fmt.Println(err.Error())
  }
  
  err = xml.Unmarshal(byteValue, &data)
  if err != nil {
    fmt.Println(err.Error())
  }
  
  return data
}

func parseXbrlByDecoder(filepath string) Data {
  file, err := os.Open(filepath)

  if err != nil {
    fmt.Println(err)
  }

  defer file.Close()

  var data Data

  decoder := xml.NewDecoder(file)
  decoder.CharsetReader = makeCharsetReader
  err = decoder.Decode(&data)
  if err != nil {
    fmt.Println(err)
  }

  return data
}

func makeCharsetReader(charset string, reader io.Reader) (io.Reader, error) {
  encoding, err := ianaindex.IANA.Encoding(charset)
  if err != nil {
    return nil, fmt.Errorf("charset %s: %s", charset, err.Error())
  }
  
  if encoding == nil {
    // Assume it's compatible with (a subset of) UTF-8 encoding
    // Bug: https://github.com/golang/go/issues/19421
    return reader, nil
  }
  
  return encoding.NewDecoder().Reader(reader), nil
}