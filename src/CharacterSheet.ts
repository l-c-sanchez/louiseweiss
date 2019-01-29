interface Characteristics {
    name: string;
    age: number;
    job: string;
    town: string;
    // picture: Phaser.GameObjects.Image;
}

class CharacterSheet {
    
    private Name: string;
    private Age: number;
    private Job: string;
    private Town: string;
    // private Picture: Phaser.GameObjects.Image;

    constructor(obj:Characteristics) {
        this.Name = obj.name;
        this.Age = obj.age;
        this.Job = obj.job;
        this.Town = obj.town;
        // this.Picture = obj.picture;
    }   

    public getName() { return this.Name; }

    public getAge() {  return this.Age;  }

    public getJob() { return this.Job; }

    public getTown() { return this.Town;  }

    // public getPicture() { return this.Picture; }

}


// {}