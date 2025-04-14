class Form {
  constructor(id, name, fields) {
    this.id = id;
    this.name = name;
    this.fields = fields;
  }

  // Method to convert a JSON object into a FormModel instance
  static fromJSON(json) {
    return new Form(json.id, json.name, json.fields);
  }
}

export default Form;
