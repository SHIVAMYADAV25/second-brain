export function random(num : number):string{
    let alphabet:string = "abcdefghijklmnopurstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
    let hash:string = "";
    for(let i = 0;i <= num;i++){
        hash += alphabet[Math.floor(Math.random()*alphabet.length)]
    }
    return hash
}