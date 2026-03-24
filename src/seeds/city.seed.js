const { City } = require('../models');

const citySeeds = [{
  "name": "Mumbai",
  "country": "India"
},
{
  "name": "Delhi",
  "country": "India"
},
{
  "name": "Bangalore",
  "country": "India"
},
{
  "name": "Kolkata",
  "country": "India"
},
{
  "name": "Chennai",
  "country": "India"
},
{
  "name": "Hyderabad",
  "country": "India"
},
{
  "name": "Jaipur",
  "country": "India"
},
{
  "name": "Pune",
  "country": "India"
},
{
  "name": "Ahmedabad",
  "country": "India"
},
{
  "name": "Surat",
  "country": "India"
},
{
  "name": "Chandigarh",
  "country": "India"
},
{
  "name": "Lucknow",
  "country": "India"
},
{
  "name": "Patna",
  "country": "India"
},
{
  "name": "Indore",
  "country": "India"
},
{
  "name": "Bhopal",
  "country": "India"
},
{
  "name": "Coimbatore",
  "country": "India"
},
{
  "name": "Kochi",
  "country": "India"
},
{
  "name": "Varanasi",
  "country": "India"
},
{
  "name": "Udaipur",
  "country": "India"
},
{
  "name": "Amritsar",
  "country": "India"
},
{
  "name": "Goa",
  "country": "India"
},
{
  "name": "Mysore",
  "country": "India"
},
{
  "name": "Visakhapatnam",
  "country": "India"
},
{
  "name": "Agra",
  "country": "India"
},
{
  "name": "Aurangabad",
  "country": "India"
},
{
  "name": "Karachi",
  "country": "Pakistan"
},
{
  "name": "Islamabad",
  "country": "Pakistan"
},
{
  "name": "Lahore",
  "country": "Pakistan"
},
{
  "name": "Peshawar",
  "country": "Pakistan"
},
{
  "name": "Quetta",
  "country": "Pakistan"
},
{
  "name": "Dhaka",
  "country": "Bangladesh"
},
{
  "name": "Chittagong",
  "country": "Bangladesh"
},
{
  "name": "Sylhet",
  "country": "Bangladesh"
},
{
  "name": "Cox's Bazar",
  "country": "Bangladesh"
},
{
  "name": "Colombo",
  "country": "Sri Lanka"
},
{
  "name": "Kandy",
  "country": "Sri Lanka"
},
{
  "name": "Galle",
  "country": "Sri Lanka"
},
{
  "name": "Nuwara Eliya",
  "country": "Sri Lanka"
},
{
  "name": "Kathmandu",
  "country": "Nepal"
},
{
  "name": "Pokhara",
  "country": "Nepal"
},
{
  "name": "Thimphu",
  "country": "Bhutan"
},
{
  "name": "Paro",
  "country": "Bhutan"
},
{
  "name": "Malé",
  "country": "Maldives"
},
{
  "name": "Beijing",
  "country": "China"
},
{
  "name": "Shanghai",
  "country": "China"
},
{
  "name": "Guangzhou",
  "country": "China"
},
{
  "name": "Shenzhen",
  "country": "China"
},
{
  "name": "Chengdu",
  "country": "China"
},
{
  "name": "Chongqing",
  "country": "China"
},
{
  "name": "Xi'an",
  "country": "China"
},
{
  "name": "Wuhan",
  "country": "China"
},
{
  "name": "Hangzhou",
  "country": "China"
},
{
  "name": "Nanjing",
  "country": "China"
},
{
  "name": "Tianjin",
  "country": "China"
},
{
  "name": "Harbin",
  "country": "China"
},
{
  "name": "Suzhou",
  "country": "China"
},
{
  "name": "Macau",
  "country": "China"
},
{
  "name": "Guilin",
  "country": "China"
},
{
  "name": "Hong Kong",
  "country": "China"
},
{
  "name": "Taipei",
  "country": "Taiwan"
},
{
  "name": "Kaohsiung",
  "country": "Taiwan"
},
{
  "name": "Taichung",
  "country": "Taiwan"
},
{
  "name": "Tokyo",
  "country": "Japan"
},
{
  "name": "Osaka",
  "country": "Japan"
},
{
  "name": "Kyoto",
  "country": "Japan"
},
{
  "name": "Yokohama",
  "country": "Japan"
},
{
  "name": "Nagoya",
  "country": "Japan"
},
{
  "name": "Sapporo",
  "country": "Japan"
},
{
  "name": "Fukuoka",
  "country": "Japan"
},
{
  "name": "Hiroshima",
  "country": "Japan"
},
{
  "name": "Nara",
  "country": "Japan"
},
{
  "name": "Seoul",
  "country": "South Korea"
},
{
  "name": "Busan",
  "country": "South Korea"
},
{
  "name": "Incheon",
  "country": "South Korea"
},
{
  "name": "Daegu",
  "country": "South Korea"
},
{
  "name": "Daejeon",
  "country": "South Korea"
},
{
  "name": "Gwangju",
  "country": "South Korea"
},
{
  "name": "Jeju City",
  "country": "South Korea"
},
{
  "name": "Bangkok",
  "country": "Thailand"
},
{
  "name": "Chiang Mai",
  "country": "Thailand"
},
{
  "name": "Phuket",
  "country": "Thailand"
},
{
  "name": "Pattaya",
  "country": "Thailand"
},
{
  "name": "Krabi",
  "country": "Thailand"
},
{
  "name": "Ho Chi Minh City",
  "country": "Vietnam"
},
{
  "name": "Hanoi",
  "country": "Vietnam"
},
{
  "name": "Da Nang",
  "country": "Vietnam"
},
{
  "name": "Hoi An",
  "country": "Vietnam"
},
{
  "name": "Nha Trang",
  "country": "Vietnam"
},
{
  "name": "Kuala Lumpur",
  "country": "Malaysia"
},
{
  "name": "George Town",
  "country": "Malaysia"
},
{
  "name": "Langkawi",
  "country": "Malaysia"
},
{
  "name": "Johor Bahru",
  "country": "Malaysia"
},
{
  "name": "Malacca",
  "country": "Malaysia"
},
{
  "name": "Singapore",
  "country": "Singapore"
},
{
  "name": "Jakarta",
  "country": "Indonesia"
},
{
  "name": "Denpasar",
  "country": "Indonesia"
},
{
  "name": "Surabaya",
  "country": "Indonesia"
},
{
  "name": "Yogyakarta",
  "country": "Indonesia"
},
{
  "name": "Bandung",
  "country": "Indonesia"
},
{
  "name": "Medan",
  "country": "Indonesia"
},
{
  "name": "Manila",
  "country": "Philippines"
},
{
  "name": "Cebu",
  "country": "Philippines"
},
{
  "name": "Davao",
  "country": "Philippines"
},
{
  "name": "Phnom Penh",
  "country": "Cambodia"
},
{
  "name": "Siem Reap",
  "country": "Cambodia"
},
{
  "name": "Vientiane",
  "country": "Laos"
},
{
  "name": "Luang Prabang",
  "country": "Laos"
},
{
  "name": "Yangon",
  "country": "Myanmar"
},
{
  "name": "Mandalay",
  "country": "Myanmar"
},
{
  "name": "Bandar Seri Begawan",
  "country": "Brunei"
},
{
  "name": "Dubai",
  "country": "UAE"
},
{
  "name": "Abu Dhabi",
  "country": "UAE"
},
{
  "name": "Sharjah",
  "country": "UAE"
},
{
  "name": "Doha",
  "country": "Qatar"
},
{
  "name": "Riyadh",
  "country": "Saudi Arabia"
},
{
  "name": "Jeddah",
  "country": "Saudi Arabia"
},
{
  "name": "Mecca",
  "country": "Saudi Arabia"
},
{
  "name": "Medina",
  "country": "Saudi Arabia"
},
{
  "name": "Dammam",
  "country": "Saudi Arabia"
},
{
  "name": "Jerusalem",
  "country": "Israel"
},
{
  "name": "Tel Aviv",
  "country": "Israel"
},
{
  "name": "Haifa",
  "country": "Israel"
},
{
  "name": "Amman",
  "country": "Jordan"
},
{
  "name": "Petra (Wadi Musa)",
  "country": "Jordan"
},
{
  "name": "Beirut",
  "country": "Lebanon"
},
{
  "name": "Byblos",
  "country": "Lebanon"
},
{
  "name": "Muscat",
  "country": "Oman"
},
{
  "name": "Salalah",
  "country": "Oman"
},
{
  "name": "Manama",
  "country": "Bahrain"
},
{
  "name": "Kuwait City",
  "country": "Kuwait"
},
{
  "name": "Tehran",
  "country": "Iran"
},
{
  "name": "Isfahan",
  "country": "Iran"
},
{
  "name": "Shiraz",
  "country": "Iran"
},
{
  "name": "Mashhad",
  "country": "Iran"
},
{
  "name": "London",
  "country": "UK"
},
{
  "name": "Manchester",
  "country": "UK"
},
{
  "name": "Edinburgh",
  "country": "UK"
},
{
  "name": "Glasgow",
  "country": "UK"
},
{
  "name": "Liverpool",
  "country": "UK"
},
{
  "name": "Birmingham",
  "country": "UK"
},
{
  "name": "Bristol",
  "country": "UK"
},
{
  "name": "Oxford",
  "country": "UK"
},
{
  "name": "Cambridge",
  "country": "UK"
},
{
  "name": "Belfast",
  "country": "UK"
},
{
  "name": "Dublin",
  "country": "Ireland"
},
{
  "name": "Cork",
  "country": "Ireland"
},
{
  "name": "Galway",
  "country": "Ireland"
},
{
  "name": "Paris",
  "country": "France"
},
{
  "name": "Lyon",
  "country": "France"
},
{
  "name": "Marseille",
  "country": "France"
},
{
  "name": "Nice",
  "country": "France"
},
{
  "name": "Bordeaux",
  "country": "France"
},
{
  "name": "Toulouse",
  "country": "France"
},
{
  "name": "Cannes",
  "country": "France"
},
{
  "name": "Strasbourg",
  "country": "France"
},
{
  "name": "Lille",
  "country": "France"
},
{
  "name": "Madrid",
  "country": "Spain"
},
{
  "name": "Barcelona",
  "country": "Spain"
},
{
  "name": "Valencia",
  "country": "Spain"
},
{
  "name": "Seville",
  "country": "Spain"
},
{
  "name": "Granada",
  "country": "Spain"
},
{
  "name": "Bilbao",
  "country": "Spain"
},
{
  "name": "Málaga",
  "country": "Spain"
},
{
  "name": "Palma de Mallorca",
  "country": "Spain"
},
{
  "name": "Ibiza Town",
  "country": "Spain"
},
{
  "name": "Lisbon",
  "country": "Portugal"
},
{
  "name": "Porto",
  "country": "Portugal"
},
{
  "name": "Funchal",
  "country": "Portugal"
},
{
  "name": "Rome",
  "country": "Italy"
},
{
  "name": "Milan",
  "country": "Italy"
},
{
  "name": "Venice",
  "country": "Italy"
},
{
  "name": "Florence",
  "country": "Italy"
},
{
  "name": "Naples",
  "country": "Italy"
},
{
  "name": "Turin",
  "country": "Italy"
},
{
  "name": "Bologna",
  "country": "Italy"
},
{
  "name": "Verona",
  "country": "Italy"
},
{
  "name": "Pisa",
  "country": "Italy"
},
{
  "name": "Palermo",
  "country": "Italy"
},
{
  "name": "Genoa",
  "country": "Italy"
},
{
  "name": "Siena",
  "country": "Italy"
},
{
  "name": "Berlin",
  "country": "Germany"
},
{
  "name": "Munich",
  "country": "Germany"
},
{
  "name": "Frankfurt",
  "country": "Germany"
},
{
  "name": "Hamburg",
  "country": "Germany"
},
{
  "name": "Cologne",
  "country": "Germany"
},
{
  "name": "Düsseldorf",
  "country": "Germany"
},
{
  "name": "Stuttgart",
  "country": "Germany"
},
{
  "name": "Leipzig",
  "country": "Germany"
},
{
  "name": "Dresden",
  "country": "Germany"
},
{
  "name": "Amsterdam",
  "country": "Netherlands"
},
{
  "name": "Rotterdam",
  "country": "Netherlands"
},
{
  "name": "The Hague",
  "country": "Netherlands"
},
{
  "name": "Utrecht",
  "country": "Netherlands"
},
{
  "name": "Brussels",
  "country": "Belgium"
},
{
  "name": "Antwerp",
  "country": "Belgium"
},
{
  "name": "Bruges",
  "country": "Belgium"
},
{
  "name": "Ghent",
  "country": "Belgium"
},
{
  "name": "Zurich",
  "country": "Switzerland"
},
{
  "name": "Geneva",
  "country": "Switzerland"
},
{
  "name": "Basel",
  "country": "Switzerland"
},
{
  "name": "Lausanne",
  "country": "Switzerland"
},
{
  "name": "Bern",
  "country": "Switzerland"
},
{
  "name": "Lucerne",
  "country": "Switzerland"
},
{
  "name": "Vienna",
  "country": "Austria"
},
{
  "name": "Salzburg",
  "country": "Austria"
},
{
  "name": "Innsbruck",
  "country": "Austria"
},
{
  "name": "Graz",
  "country": "Austria"
},
{
  "name": "Copenhagen",
  "country": "Denmark"
},
{
  "name": "Aarhus",
  "country": "Denmark"
},
{
  "name": "Odense",
  "country": "Denmark"
},
{
  "name": "Stockholm",
  "country": "Sweden"
},
{
  "name": "Gothenburg",
  "country": "Sweden"
},
{
  "name": "Malmö",
  "country": "Sweden"
},
{
  "name": "Oslo",
  "country": "Norway"
},
{
  "name": "Bergen",
  "country": "Norway"
},
{
  "name": "Trondheim",
  "country": "Norway"
},
{
  "name": "Helsinki",
  "country": "Finland"
},
{
  "name": "Rovaniemi",
  "country": "Finland"
},
{
  "name": "Warsaw",
  "country": "Poland"
},
{
  "name": "Krakow",
  "country": "Poland"
},
{
  "name": "Gdansk",
  "country": "Poland"
},
{
  "name": "Wroclaw",
  "country": "Poland"
},
{
  "name": "Prague",
  "country": "Czech Republic"
},
{
  "name": "Brno",
  "country": "Czech Republic"
},
{
  "name": "Český Krumlov",
  "country": "Czech Republic"
},
{
  "name": "Budapest",
  "country": "Hungary"
},
{
  "name": "Debrecen",
  "country": "Hungary"
},
{
  "name": "Athens",
  "country": "Greece"
},
{
  "name": "Thessaloniki",
  "country": "Greece"
},
{
  "name": "Santorini (Fira)",
  "country": "Greece"
},
{
  "name": "Mykonos",
  "country": "Greece"
},
{
  "name": "Istanbul",
  "country": "Turkey"
},
{
  "name": "Ankara",
  "country": "Turkey"
},
{
  "name": "Antalya",
  "country": "Turkey"
},
{
  "name": "Izmir",
  "country": "Turkey"
},
{
  "name": "Göreme (Cappadocia)",
  "country": "Turkey"
},
{
  "name": "Moscow",
  "country": "Russia"
},
{
  "name": "Saint Petersburg",
  "country": "Russia"
},
{
  "name": "Kazan",
  "country": "Russia"
},
{
  "name": "Sochi",
  "country": "Russia"
},
{
  "name": "Kyiv",
  "country": "Ukraine"
},
{
  "name": "Lviv",
  "country": "Ukraine"
},
{
  "name": "Odesa",
  "country": "Ukraine"
},
{
  "name": "Bucharest",
  "country": "Romania"
},
{
  "name": "Cluj-Napoca",
  "country": "Romania"
},
{
  "name": "Brașov",
  "country": "Romania"
},
{
  "name": "Sofia",
  "country": "Bulgaria"
},
{
  "name": "Plovdiv",
  "country": "Bulgaria"
},
{
  "name": "Zagreb",
  "country": "Croatia"
},
{
  "name": "Dubrovnik",
  "country": "Croatia"
},
{
  "name": "Split",
  "country": "Croatia"
},
{
  "name": "Belgrade",
  "country": "Serbia"
},
{
  "name": "Novi Sad",
  "country": "Serbia"
},
{
  "name": "Ljubljana",
  "country": "Slovenia"
},
{
  "name": "Bled",
  "country": "Slovenia"
},
{
  "name": "Bratislava",
  "country": "Slovakia"
},
{
  "name": "Košice",
  "country": "Slovakia"
},
{
  "name": "Vilnius",
  "country": "Lithuania"
},
{
  "name": "Riga",
  "country": "Latvia"
},
{
  "name": "Tallinn",
  "country": "Estonia"
},
{
  "name": "Reykjavik",
  "country": "Iceland"
},
{
  "name": "Valletta",
  "country": "Malta"
},
{
  "name": "Nicosia",
  "country": "Cyprus"
},
{
  "name": "Limassol",
  "country": "Cyprus"
},
{
  "name": "Tbilisi",
  "country": "Georgia"
},
{
  "name": "Batumi",
  "country": "Georgia"
},
{
  "name": "Yerevan",
  "country": "Armenia"
},
{
  "name": "Baku",
  "country": "Azerbaijan"
},
{
  "name": "Cairo",
  "country": "Egypt"
},
{
  "name": "Alexandria",
  "country": "Egypt"
},
{
  "name": "Luxor",
  "country": "Egypt"
},
{
  "name": "Sharm El-Sheikh",
  "country": "Egypt"
},
{
  "name": "Giza",
  "country": "Egypt"
},
{
  "name": "Marrakech",
  "country": "Morocco"
},
{
  "name": "Casablanca",
  "country": "Morocco"
},
{
  "name": "Fes",
  "country": "Morocco"
},
{
  "name": "Rabat",
  "country": "Morocco"
},
{
  "name": "Tangier",
  "country": "Morocco"
},
{
  "name": "Chefchaouen",
  "country": "Morocco"
},
{
  "name": "Tunis",
  "country": "Tunisia"
},
{
  "name": "Sousse",
  "country": "Tunisia"
},
{
  "name": "Algiers",
  "country": "Algeria"
},
{
  "name": "Oran",
  "country": "Algeria"
},
{
  "name": "Cape Town",
  "country": "South Africa"
},
{
  "name": "Johannesburg",
  "country": "South Africa"
},
{
  "name": "Durban",
  "country": "South Africa"
},
{
  "name": "Pretoria",
  "country": "South Africa"
},
{
  "name": "Port Elizabeth",
  "country": "South Africa"
},
{
  "name": "Nairobi",
  "country": "Kenya"
},
{
  "name": "Mombasa",
  "country": "Kenya"
},
{
  "name": "Dar es Salaam",
  "country": "Tanzania"
},
{
  "name": "Zanzibar City",
  "country": "Tanzania"
},
{
  "name": "Arusha",
  "country": "Tanzania"
},
{
  "name": "Addis Ababa",
  "country": "Ethiopia"
},
{
  "name": "Lalibela",
  "country": "Ethiopia"
},
{
  "name": "Accra",
  "country": "Ghana"
},
{
  "name": "Kumasi",
  "country": "Ghana"
},
{
  "name": "Lagos",
  "country": "Nigeria"
},
{
  "name": "Abuja",
  "country": "Nigeria"
},
{
  "name": "Dakar",
  "country": "Senegal"
},
{
  "name": "Abidjan",
  "country": "Ivory Coast"
},
{
  "name": "Kampala",
  "country": "Uganda"
},
{
  "name": "Kigali",
  "country": "Rwanda"
},
{
  "name": "Gaborone",
  "country": "Botswana"
},
{
  "name": "Harare",
  "country": "Zimbabwe"
},
{
  "name": "Victoria Falls",
  "country": "Zimbabwe"
},
{
  "name": "Windhoek",
  "country": "Namibia"
},
{
  "name": "Lusaka",
  "country": "Zambia"
},
{
  "name": "Port Louis",
  "country": "Mauritius"
},
{
  "name": "New York City",
  "country": "USA"
},
{
  "name": "Los Angeles",
  "country": "USA"
},
{
  "name": "San Francisco",
  "country": "USA"
},
{
  "name": "Chicago",
  "country": "USA"
},
{
  "name": "Miami",
  "country": "USA"
},
{
  "name": "Las Vegas",
  "country": "USA"
},
{
  "name": "Washington, D.C.",
  "country": "USA"
},
{
  "name": "Boston",
  "country": "USA"
},
{
  "name": "Seattle",
  "country": "USA"
},
{
  "name": "San Diego",
  "country": "USA"
},
{
  "name": "Austin",
  "country": "USA"
},
{
  "name": "Dallas",
  "country": "USA"
},
{
  "name": "Houston",
  "country": "USA"
},
{
  "name": "Phoenix",
  "country": "USA"
},
{
  "name": "Atlanta",
  "country": "USA"
},
{
  "name": "New Orleans",
  "country": "USA"
},
{
  "name": "Philadelphia",
  "country": "USA"
},
{
  "name": "Denver",
  "country": "USA"
},
{
  "name": "Orlando",
  "country": "USA"
},
{
  "name": "Honolulu",
  "country": "USA"
},
{
  "name": "San Antonio",
  "country": "USA"
},
{
  "name": "Detroit",
  "country": "USA"
},
{
  "name": "Portland",
  "country": "USA"
},
{
  "name": "Toronto",
  "country": "Canada"
},
{
  "name": "Vancouver",
  "country": "Canada"
},
{
  "name": "Montreal",
  "country": "Canada"
},
{
  "name": "Ottawa",
  "country": "Canada"
},
{
  "name": "Calgary",
  "country": "Canada"
},
{
  "name": "Quebec City",
  "country": "Canada"
},
{
  "name": "Edmonton",
  "country": "Canada"
},
{
  "name": "Victoria",
  "country": "Canada"
},
{
  "name": "Mexico City",
  "country": "Mexico"
},
{
  "name": "Cancún",
  "country": "Mexico"
},
{
  "name": "Guadalajara",
  "country": "Mexico"
},
{
  "name": "Monterrey",
  "country": "Mexico"
},
{
  "name": "Tijuana",
  "country": "Mexico"
},
{
  "name": "Puebla",
  "country": "Mexico"
},
{
  "name": "Mérida",
  "country": "Mexico"
},
{
  "name": "Oaxaca",
  "country": "Mexico"
},
{
  "name": "Havana",
  "country": "Cuba"
},
{
  "name": "Santo Domingo",
  "country": "Dominican Republic"
},
{
  "name": "Punta Cana",
  "country": "Dominican Republic"
},
{
  "name": "San Juan",
  "country": "Puerto Rico"
},
{
  "name": "Nassau",
  "country": "Bahamas"
},
{
  "name": "Kingston",
  "country": "Jamaica"
},
{
  "name": "Montego Bay",
  "country": "Jamaica"
},
{
  "name": "Port of Spain",
  "country": "Trinidad and Tobago"
},
{
  "name": "Panama City",
  "country": "Panama"
},
{
  "name": "San José",
  "country": "Costa Rica"
},
{
  "name": "Guatemala City",
  "country": "Guatemala"
},
{
  "name": "Belize City",
  "country": "Belize"
},
{
  "name": "Rio de Janeiro",
  "country": "Brazil"
},
{
  "name": "São Paulo",
  "country": "Brazil"
},
{
  "name": "Brasília",
  "country": "Brazil"
},
{
  "name": "Salvador",
  "country": "Brazil"
},
{
  "name": "Belo Horizonte",
  "country": "Brazil"
},
{
  "name": "Recife",
  "country": "Brazil"
},
{
  "name": "Fortaleza",
  "country": "Brazil"
},
{
  "name": "Buenos Aires",
  "country": "Argentina"
},
{
  "name": "Córdoba",
  "country": "Argentina"
},
{
  "name": "Mendoza",
  "country": "Argentina"
},
{
  "name": "Bariloche",
  "country": "Argentina"
},
{
  "name": "Rosario",
  "country": "Argentina"
},
{
  "name": "Santiago",
  "country": "Chile"
},
{
  "name": "Valparaíso",
  "country": "Chile"
},
{
  "name": "San Pedro de Atacama",
  "country": "Chile"
},
{
  "name": "Lima",
  "country": "Peru"
},
{
  "name": "Cusco",
  "country": "Peru"
},
{
  "name": "Arequipa",
  "country": "Peru"
},
{
  "name": "Bogotá",
  "country": "Colombia"
},
{
  "name": "Medellín",
  "country": "Colombia"
},
{
  "name": "Cartagena",
  "country": "Colombia"
},
{
  "name": "Cali",
  "country": "Colombia"
},
{
  "name": "Quito",
  "country": "Ecuador"
},
{
  "name": "Guayaquil",
  "country": "Ecuador"
},
{
  "name": "Cuenca",
  "country": "Ecuador"
},
{
  "name": "Montevideo",
  "country": "Uruguay"
},
{
  "name": "Punta del Este",
  "country": "Uruguay"
},
{
  "name": "Colonia del Sacramento",
  "country": "Uruguay"
},
{
  "name": "Asunción",
  "country": "Paraguay"
},
{
  "name": "La Paz",
  "country": "Bolivia"
},
{
  "name": "Santa Cruz",
  "country": "Bolivia"
},
{
  "name": "Sucre",
  "country": "Bolivia"
},
{
  "name": "Caracas",
  "country": "Venezuela"
},
{
  "name": "Sydney",
  "country": "Australia"
},
{
  "name": "Melbourne",
  "country": "Australia"
},
{
  "name": "Brisbane",
  "country": "Australia"
},
{
  "name": "Perth",
  "country": "Australia"
},
{
  "name": "Adelaide",
  "country": "Australia"
},
{
  "name": "Canberra",
  "country": "Australia"
},
{
  "name": "Gold Coast",
  "country": "Australia"
},
{
  "name": "Auckland",
  "country": "New Zealand"
},
{
  "name": "Wellington",
  "country": "New Zealand"
},
{
  "name": "Christchurch",
  "country": "New Zealand"
},
{
  "name": "Queenstown",
  "country": "New Zealand"
},
{
  "name": "Rotorua",
  "country": "New Zealand"
},
{
  "name": "Suva",
  "country": "Fiji"
},
{
  "name": "Nadi",
  "country": "Fiji"
},
{
  "name": "Port Moresby",
  "country": "Papua New Guinea"
},
{
  "name": "Apia",
  "country": "Samoa"
},
{
  "name": "Nuku'alofa",
  "country": "Tonga"
},
{
  "name": "Port Vila",
  "country": "Vanuatu"
},
{
  "name": "Papeete",
  "country": "French Polynesia"
}];

const seedCity = async () => {
  try {
    console.log('🏢 Seeding cities...');

    const existingCount = await City.countDocuments().catch((e) => { console.log(e) });
    if (existingCount > 0) {
      console.log(`🗑️  ${existingCount} cities already exist. Skipping seeding.`);
      return { skipped: true, count: existingCount };
    }

    if (!Array.isArray(citySeeds) || citySeeds.length === 0) {
      throw new Error('Invalid city data: must be non-empty array');
    }

    // Process in batches to handle large dataset
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < citySeeds.length; i += batchSize) {
      const batch = citySeeds.slice(i, i + batchSize);
      try {
        const batchResult = await City.insertMany(batch, { ordered: false });
        if (batchResult) results.push(...batchResult);
      } catch (batchError) {
        console.warn(`⚠️  City batch ${Math.floor(i / batchSize) + 1} had issues:`, batchError.message);
        // If some succeeded, they might be in batchError.insertedDocs
        if (batchError.insertedDocs) {
          results.push(...batchError.insertedDocs);
        }
      }
    }

    console.log(`✅ Successfully seeded ${results.length} cities`);
    return { success: true, count: results.length, data: results };

  } catch (error) {
    console.error('❌ Error seeding cities:', error.message);
    return { success: false, error: error.message, count: 0 };
  }
};

module.exports = seedCity;