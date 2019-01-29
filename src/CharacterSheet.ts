interface Characteristics {
    name: string;
    age: number;
    job: string;
    town: string;
    education: string;
    // picture: Phaser.GameObjects.Image;
}

class CharacterSheet {
    
    private Name: string;
    private Age: number;
    private Job: string;
    private Town: string;
    private Education:string;
    // private Picture: Phaser.GameObjects.Image;

    constructor(obj:Characteristics) {
        this.Name = obj.name;
        this.Age = obj.age;
        this.Job = obj.job;
        this.Town = obj.town;
        this.Education = obj.education;
        // this.Picture = obj.picture;
    }   

    public getName() { return this.Name; }

    public getAge() {  return this.Age;  }

    public getJob() { return this.Job; }

    public getTown() { return this.Town;  }

    public getEducation() { return this.Education }

    // public getPicture() { return this.Picture; }

}


// {}