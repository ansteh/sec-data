package main

import (
  "fmt"
)

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