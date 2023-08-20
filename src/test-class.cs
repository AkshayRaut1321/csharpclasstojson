class Employee
{
    int id
    { get; 
    set; };

    string Name {get;set;}

    Address address {get;set;}

    Contact Contact;
}

class Address
{
    string City {get;set;};

    string Name {get;set;}
}

class Contact
{
    int PhoneNo;

    string _email;

    string Email
    {
        get{
            return _email;
        }
    }
}