class Employee
{
    int id
    { get; 
    set; };

    string Name {get;set;}

    Address address {get;set;}

    Contact Contact;

    List<Contact> Contacts {get; set;}

    List<string> NamesProp {get;set;}

    List<string> NamesField;

    Dictionary<string, int> CountsField;

    Dictionary<string, int> CountsProp {get; set;};
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