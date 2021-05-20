package main

import (
  "encoding/xml"
  "golang.org/x/text/encoding/ianaindex"
  "fmt"
  "io"
  "io/ioutil"
  "os"
)

func parseXbrl(filepath string) Document {
  file, err := os.Open(filepath)

  if err != nil {
    fmt.Println(err)
  }

  defer file.Close()
  
  var data Document
  
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

func parseXbrlByDecoder(filepath string) Document {
  file, err := os.Open(filepath)

  if err != nil {
    fmt.Println(err)
  }

  defer file.Close()

  var data Document

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