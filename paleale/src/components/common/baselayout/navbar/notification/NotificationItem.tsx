import { DateTime } from "luxon";

export default class NotificationItem {
    public title: string;
    public read: boolean; // if the user has read the notification
    public type: string;
    public date: DateTime;
    public beerNum: number;
    constructor(title: string, read: boolean, type: string, date: DateTime, beerNum: number) {
        this.title = title;
        this.read = read;
        this.type = type;
        this.date = date;
        this.beerNum = beerNum;
    }
    public generateText() {
        switch (this.type) {
            case "party":
                return this.beerNum + " upcoming beer(s) in the next 2 weeks!";
            case "today":
                return this.beerNum + " beer(s) that will expire today!";
            case "expired":
                return this.beerNum + " beer(s) has expired!";
        }
    }
    public getIntent() {
        switch (this.type) {
            case "party":
                return "primary";
            case "today":
                return "warning";
            case "expired":
                return "danger";
        }
    }
    public getDate() {
        return this.date.toISODate();
    }
    public setRead(read: boolean) {
        this.read = read;
    }
}
