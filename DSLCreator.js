'use strict';

exports.getCompanyFilters =  function(req){
      var locationFilters = makeFilterArray(req.body.filters.Locations);
      var statusFilters = makeFilterArray(req.body.filters.Status);
      var colorFilters = makeFilterArray(req.body.filters.Color);
      var tSegmentFilters = makeFilterArray(req.body.filters.Tvalue);
      for(var i=0;i<tSegmentFilters.length;i++){
        tSegmentFilters[i] = tSegmentFilters[i].toLowerCase();
      }

      var mustArray = [
                {
                    "match":{
                      "OPCO": req.body.Opco
                    }
                },
                {
                  "terms": {
                    "HortonStatus": statusFilters
                  }
                }
              ];
          if(req.body.GridPos.length){
              mustArray.push({
                  "terms": {
                    "GridPos": req.body.GridPos
                    }
                  });
          }
          else{
            mustArray.push({
                  "terms": {
                    "Color": colorFilters
                    }
                  });
          }
      var filters = [];

      
      if(req.body.Opco=='RP'){
        if(tSegmentFilters[0]!=''){
          filters.push({
                "terms":{
                  "AccountType2":tSegmentFilters
                }
            });
        }
      }
      filters.push({"exists" : { "field" : "Longitude" }});
      if(locationFilters[0]!=""){
        filters.push({"terms":{"LocationType": locationFilters}});
      }
      if(req.body.metro && req.body.metro != ""){

        filters.push({"match_phrase":{"CBSAName": req.body.metro}});
      }

                // if(req.body.filters.Industry) {            
                //   if(req.body.filters.Industry.value!=null){
                //       console.log("HERE IN INDUSTRY");
                //     filters.push({"match_phrase":{"Industry": req.body.filters.Industry.value.Description}});
                //   }
                // }
            
           if(req.body.filters.Industry) {            
                  // if(req.body.filters.Industry.value!=null){
                  if(req.body.filters.Industry.length){
                      console.log("HERE IN INDUSTRY");
                    // filters.push({"match_phrase":{"Industry": req.body.filters.Industry.value.Description}});
                    filters.push({"bool":{"should":makeIndustryArray(req.body.filters.Industry, "Industry")}});
                  }
                } 
            if(req.body.filters.User!="" || !req.body.globalswitch){



              var territoryFilter = {"nested":{
                                    "path": "TerritoryOwner",
                                    
                                    "query":{
                                            "match":{
                                              "TerritoryOwner.OwnerUserID": req.body.filters.User
                                            }
                                          }
                                        }
                                      };

              var segmentTerms = [];
              if(req.body.filters.DBFilters.MyDB){
                segmentTerms.push("sales");
              }
              
              if(req.body.filters.DBFilters.nurturing){
                segmentTerms.push("nurture");
              }

            

              var bizFilter = {"nested":{
                                      "path": "BizOwner",
                                      "query":{
                                        "bool":{
                                            "must":[  {
                                                            "match":{
                                                              "BizOwner.OwnerUserID": req.body.filters.User
                                                            }
                                                          },
                                         
                                          {
                                            "terms":{
                                              "BizOwner.Segment":segmentTerms
                                            }
                                          }]


                                          }
                                        }
                                          }          
                                        };

              var bizNotFilter = {"nested":{
                                      "path": "BizOwner",
                                      "query":{
                                        "bool":{
                                            "must":[  {
                                                            "match":{
                                                              "BizOwner.OwnerUserID": req.body.filters.User
                                                            }
                                                          },
                                         
                                          {
                                            "terms":{
                                              "BizOwner.Segment":[]
                                            }
                                          }]


                                          }
                                        }
                                          }          
                                        };


            var dbFilter = req.body.filters.Database;

            if(req.body.Opco=='RGSOA'){
              
                    if(tSegmentFilters[0]!=''){
                     // console.log(tSegmentFilters);
                      if(dbFilter==3||dbFilter==7||dbFilter==9){
                        bizFilter.nested.query.bool.must.push({
                          "terms":{
                            "BizOwner.AccountType2": tSegmentFilters
                          }
                        });
                      }
                    }
                  }
          
          
              if(dbFilter==2||dbFilter==6){

                  bizFilter.nested.query.bool.must[1].terms['BizOwner.Segment']=["sales", "nurture"];
                    mustArray.push({
                      "bool":{
                        "must":territoryFilter,
                        "must_not": bizFilter
                      }
                    });
                  }

              if(dbFilter==3){
                    mustArray.push(bizFilter);

                  //   mustArray.push({
                  //     "bool":{
                  //       "must":[territoryFilter, bizFilter]
                  //     }
                  //   });
                  }

              if(dbFilter==5){
                  var notSegment = [];

                  if(segmentTerms.length<2){
                    if(req.body.filters.DBFilters.MyDB){
                    notSegment.push("nurture");
                  }
                  
                  if(req.body.filters.DBFilters.nurturing){
                    notSegment.push("sales");
                  }

                  bizNotFilter.nested.query.bool.must[1].terms['BizOwner.Segment']=notSegment;
                    mustArray.push({
                      "bool":{
                        "should":[territoryFilter, bizFilter],
                        "must_not": bizNotFilter
                      }
                    });

                  }
                  else{
                    // mustArray.push(territoryFilter);
                    mustArray.push({
                      "bool":{
                        "should":[territoryFilter, bizFilter]
                      }
                    });
                  }
                  
                    
              }

              if(dbFilter==7){
                    mustArray.push(bizFilter);
              }

                  if(dbFilter==9){
                    mustArray.push({
                      "bool":{
                        "should":[territoryFilter, bizFilter]
                      }
                    })
                  }



                   var reviewStatus = [];

                  if(req.body.filters.Review.Rejected||req.body.filters.Review.Nurturing){

                    if(req.body.filters.Review.Rejected){
                      reviewStatus.push("rejected");
                    }
                    if(req.body.filters.Review.Nurturing){
                      reviewStatus.push("nurturing");
                    }
                    mustArray.push({
                              "terms": {
                                // "OpcoSpecifics.ReviewStatus": reviewStatus
                                "ReviewStatus": reviewStatus

                                }

                              });

                  }
           
            }

        var mustBool = {
          "bool":{
            "must": mustArray
          }
        };
        filters.push(mustBool);




        return filters;
  }

exports.getCompanyMustNotQuery = function(req){

  var mustNotFilter = [
            {
               "bool": {
                  "must": [
                     {
                        "bool": {
                           "must_not": [
                              {
                                 "nested": {
                                    "path": "BizOwner",
                                    "query": {
                                       "match": {
                                          "BizOwner.OwnerUserID": req.body.filters.User
                                       }
                                    }
                                 }
                              }
                           ]
                        }
                     },
                     {
                        "terms": {
                           "GridPos": [
                              "u4"
                           ]
                        }
                     }
                  ]
               }
            }
         ];

         if(req.body.globalswitch){

          return {"term":{"GridPos": "no value"}}
         }
         else{
          return mustNotFilter;
         }         
}

exports.getContactFilters =  function(req){
  var locationFilters = makeFilterArray(req.body.filters.Locations);
  var statusFilters = makeFilterArray(req.body.filters.Status);
  var colorFilters = makeFilterArray(req.body.filters.Color);
  var lobFilters = makeFilterArray(req.body.filters.LoB);
  var rgsIndex = lobFilters.indexOf('rgs');
  var invalidFilters =  req.body.filters.invalid;
  if(rgsIndex>=0){
    lobFilters[rgsIndex] = 'rgsoa';
  }
  lobFilters.splice(lobFilters.indexOf(req.body.Opco.toLowerCase()), 1); //remove the logged in user's opco.

  var filters = [];

  filters.push({
    "match":{
      "OPCO": req.body.Opco
    }
  });

  if(lobFilters.length){

    filters.push({
      "nested": {
        "path":"OPCO_Flag",
        "query":{
          "terms":{
            "OPCO_Flag.IDs": lobFilters
          }
        }
      }
    })
  }

  var contactLocationFilters = [];

  if(req.body.GridPos.length){
    contactLocationFilters.push({
      "terms": {
        "ContactLocations.GridPos": req.body.GridPos
      }
    });
  }
  // else if(colorFilters.indexOf('undefined')<0){
  else{
    contactLocationFilters.push({
      "terms": {
        "ContactLocations.Color": colorFilters
      }
    });
  }

  var metro;
  if(req.body.metro){

    if(req.body.metro._source){
      metro = req.body.metro._source.CBSAName;
      contactLocationFilters.push({"match_phrase":{"ContactLocations.CBSAName": metro}});
    }
        
      
    else{
      metro= req.body.metro;
      contactLocationFilters.push({"match_phrase":{"ContactLocations.CBSAName": metro}});
    }
  }
  //contactLocationFilters.push({"terms":{"ContactLocations.LocationType": locationFilters}});
        

  filters.push({
    "terms": {
      "HortonContactStatus": statusFilters
    }
  });

  if(req.body.filters.Activity.fromDate||req.body.filters.Activity.toDate){

    var rangeFilter = {
      "range":{
        "LastConnectDate":{}
      }
    };
    if(req.body.filters.Activity.fromDate){
      rangeFilter.range.LastConnectDate.gte = req.body.filters.Activity.fromDate.split('T')[0];
    }
    if(req.body.filters.Activity.toDate){
      rangeFilter.range.LastConnectDate.lte = req.body.filters.Activity.toDate.split('T')[0];
    }

    filters.push(rangeFilter);

  }

  if(req.body.filters.Industry) {
    // if(req.body.filters.Industry.value!=null){
    if(req.body.filters.Industry.length){
      console.log("HERE IN INDUSTRY");
      // contactLocationFilters.push({"match_phrase":{"ContactLocations.Industry": req.body.filters.Industry.value.Description}});
      contactLocationFilters.push({"bool":{"should":makeIndustryArray(req.body.filters.Industry, "ContactLocations.Industry")}});

    }
  }
            
  if(req.body.filters.User!="" || !req.body.globalswitch){


    var nested = {
      "nested":{
        "path": "ContactLocations",
        "query":{
          "bool":{
            "must": contactLocationFilters
          }
        }
      }
    };

    filters.push(nested);


    var matchBizOwner = {
      "match":{
        "BizOwner.OwnerUserID": req.body.filters.User
      }
    };
    var segmentTerms = []; //Sales or Nurturing

    var contactBizFilter = {
      "nested":{
        "path": "BizOwner"
      }
    };

    if(invalidFilters && !invalidFilters.leftCompany){

      var invalidFilter = {
        "bool":{
          "must_not":{
            "terms":{
              "FO_Effective_Status.keyword":[
                "Left Company",
                "Inactive"
              ]
            }
          }
        }
      };

      filters.push(invalidFilter);

    }


    var dbFilter = req.body.filters.Database;
    if(dbFilter==3){

      var termFilter = {"term":{"BizOwner.Segment": "sales"}};
      contactBizFilter.nested.query = {"bool":{"must":[matchBizOwner, termFilter]}};
           

    }

    if(dbFilter==4){

      var termFilter = {"term":{"BizOwner.Segment": "nurture"}};
      contactBizFilter.nested.query = {"bool":{"must":[matchBizOwner, termFilter]}};
            
    }

    if(dbFilter==5){

      var termFilter = {"term":{"BizOwner.Segment": "nurture"}};
      contactBizFilter.nested.query = {"bool":{"must_not":{"bool":{"must":[matchBizOwner, termFilter]}}}};
            
    }

    if(dbFilter==6){

      var termFilter = {"term":{"BizOwner.Segment": "sales"}};
      contactBizFilter.nested.query = {"bool":{"must_not":{"bool":{"must":[matchBizOwner, termFilter]}}}};
            
    }

    if(dbFilter==7){

      var termFilter = {"terms":{"BizOwner.Segment": ["sales", "nurture"]}};
      contactBizFilter.nested.query = {"bool":{"must":[matchBizOwner, termFilter]}};
            
    }

    if(dbFilter){
      if(dbFilter!==2 && dbFilter!==9){
        filters.push(contactBizFilter);

      }
    }
  }


  return filters;
}

exports.getSystemContactFilters =  function(req){
  var locationFilters = makeFilterArray(req.body.filters.Locations);
  var statusFilters = makeFilterArray(req.body.filters.Status);
  var colorFilters = makeFilterArray(req.body.filters.Color);
  var lobFilters = makeFilterArray(req.body.filters.LoB);
  lobFilters.splice(lobFilters.indexOf(req.body.Opco.toLowerCase()), 1); //remove the logged in user's opco.

  var filters = [];

  var metro;
  if(req.body.metro){
    if(req.body.metro._source){
      metro = req.body.metro._source.CBSAName;
      filters.push({"match_phrase":{"CBSAName": metro}});
    }
        
    else{
      metro= req.body.metro;
      filters.push({"match_phrase":{"CBSAName": metro}});
    }
  }


  var opcoSpecificFilters = [];

  opcoSpecificFilters.push({
    "match":{
      "OpcoSpecifics.OPCO": req.body.Opco
    }
  });



  if(req.body.GridPos.length){
    opcoSpecificFilters.push({
      "terms": {
        "OpcoSpecifics.GridPos": req.body.GridPos
      }
    });
  }
  // else if(colorFilters.indexOf('undefined')<0){
  else {

    opcoSpecificFilters.push({
      "terms": {
        "OpcoSpecifics.Color": colorFilters
      }
    });
  }

     
       
  // contactLocationFilters.push({"match_phrase":{"ContactLocations.CBSAName": req.body.metro}});

  // opcoSpecificFilters.push({
  // "terms": {
  //     "OpcoSpecifics.HortonStatus": statusFilters
  //      }
  //  });


  if(req.body.filters.Industry) {
    // if(req.body.filters.Industry.value!=null){
    if(req.body.filters.Industry.length){
      console.log("HERE IN INDUSTRY");
      // filters.push({"match_phrase":{"Industry": req.body.filters.Industry.value.Description}});
      filters.push({"bool":{"should":makeIndustryArray(req.body.filters.Industry, "Industry")}});
    }
  }
            
  // if(req.body.filters.User!="" || !req.body.globalswitch){


  var nested = {
    "nested":{
      "path": "OpcoSpecifics",
      "query":{
        "bool":{
          "must": opcoSpecificFilters
        }
      }
    }
  };
  if(lobFilters.length){

    var shouldArray = [];

    for(var i=0;i<lobFilters.length;i++){

      shouldArray.push({
        bool:{
          must:[{
            term:{
              "OpcoSpecifics.OPCO": lobFilters[i]
            }
          },
            {
              nested:{
                path: 'OpcoSpecifics.Contact',
                query:{
                  exists:{
                    field: "OpcoSpecifics.Contact.ID"
                  }
                }

              }
            }]
        }
      });

      var completeLob = {
        "nested":{
          "path": "OpcoSpecifics",
          "query":{
            "bool":{
              "should": shouldArray
            }
          }
        }
      };

    }
    filters.push(completeLob);
  }
  filters.push(nested);


  var matchBizOwner = {
    "match":{
      "BizOwner.OwnerUserID": req.body.filters.User
    }
  };
  var segmentTerms = []; //Sales or Nurturing

  var contactBizFilter = {
    "nested":{
      "path": "BizOwner"
    }
  };

  //    var dbFilter = req.body.filters.Database;
  //    if(dbFilter==3){

  //     var termFilter = {"term":{"BizOwner.Segment": "sales"}};
  //     contactBizFilter.nested.query = {"bool":{"must":[matchBizOwner, termFilter]}};
           

  //    }

  //    if(dbFilter==4){

  //     var termFilter = {"term":{"BizOwner.Segment": "nurturing"}};
  //     contactBizFilter.nested.query = {"bool":{"must":[matchBizOwner, termFilter]}};
            
  //    }

  //    if(dbFilter==5){

  //     var termFilter = {"term":{"BizOwner.Segment": "nurturing"}};
  //     contactBizFilter.nested.query = {"bool":{"must_not":[matchBizOwner, termFilter]}};
            
  //    }

  //    if(dbFilter==6){

  //     var termFilter = {"term":{"BizOwner.Segment": "sales"}};
  //     contactBizFilter.nested.query = {"bool":{"must_not":[matchBizOwner, termFilter]}};
            
  //    }

  //    if(dbFilter==7){

  //     var termFilter = {"terms":{"BizOwner.Segment": ["sales", "nurturing"]}};
  //     contactBizFilter.nested.query = {"bool":{"must":[matchBizOwner, termFilter]}};
            
  //    }
  // }

  // filters.push(contactBizFilter);


  return filters;
}

exports.createAdvancedContactFilters = function(req){

  var mustArray = [];
  var advanceFlag = false;
  var companyFlag = false;

    if(req.body.advanceSearch.name){

      advanceFlag = true;

      var FName = req.body.advanceSearch.name.split(" ")[0];
      var LName = req.body.advanceSearch.name.split(" ")[1];
     
      if(LName) {
        mustArray.push({
          "bool":{
              "should":[
              {
                "term":
                {
                  "FirstName": FName.toLowerCase()
                }
              },
              {
                "term":
                {
                  "LastName": LName.toLowerCase()
                }
              },
              {
                  "term":{
                    "ContactID": req.body.query
                  }
                 }]
            }
        })
      }
      else {
        mustArray.push({
          "bool":{
              "should":[
              {
                "term":
                {
                  "FirstName": FName.toLowerCase()
                }
              },
              {
                "term":
                {
                  "LastName": FName.toLowerCase()
                }
              },
              {
                  "term":{
                    "ContactID": req.body.query
                  }
                 } ]
            }
        })
      }
    }

    if(req.body.advanceSearch.title){
        advanceFlag = true;
        mustArray.push({
          "match_phrase":{
            "JobTitle": req.body.advanceSearch.title
          }
        });
    }

    if(req.body.advanceSearch.foID){
        advanceFlag = true;
        mustArray.push({
          "term":{
            "ContactID": req.body.advanceSearch.foID
          }
        });
    }

    if(req.body.advanceSearch.company){
        advanceFlag = true;
        companyFlag = true;
        
    }

    if(req.body.advanceSearch.email){
        advanceFlag = true;
        mustArray.push({
          "match_phrase":{
            "Email": req.body.advanceSearch.email
          }
        });
    }

    if(req.body.advanceSearch.phone){
        advanceFlag = true;
        mustArray.push({
          "nested":{
            
              "path": "phone",
              "query": {
           
                    "match": {
                      "phone.Number": req.body.advanceSearch.phone
                    }
                  }

            }
            
          
        });

    }

    return {mustArray: mustArray,
            advanceFlag: advanceFlag,
            companyFlag: companyFlag};
}

module.exports = exports;

  function makeFilterArray(filter){

    var result = [];

    for(var key in filter){
      if(filter[key]){
        result.push(key);
      }
    }

    if(result.length){
      return result;
    }

    else{
      return [''];
    }
  }


  function makeIndustryArray(industries,field){
    var result =[];

    for(var i=0;i<industries.length;i++){

      var obj = {};
      obj["match_phrase"]={};
      obj["match_phrase"][field]= industries[i].Description;
      result.push(obj);

        
    }

    return result;
  }