class Report {
  constructor(id, title, location, date, time, status) {
    this.id = id;
    this.title = title;
    this.location = location; // e.g., { latitude: xx, longitude: yy }
    this.date = date;
    this.time = time;
    this.status = status; // e.g., "Pending", "Resolved"
  }

  // Method to mark a report as resolved
  markResolved() {
    this.status = "Closed";
  }

  // Convert to JSON format for API requests
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      location: this.location,
      date: this.date,
      time: this.time,
      status: this.status,
    };
  }

  // Factory method to create an instance from API response
  static fromJSON(data) {
    return new Report(
      data.id,
      data.title,
      data.location,
      data.date,
      data.time,
      data.status,
    );
  }
}

export default Report;
