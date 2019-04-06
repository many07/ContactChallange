import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';
import { IPerson, Person } from 'app/shared/model/person.model';
import { PersonService } from './person.service';
import { IUser, UserService } from 'app/core';
import { AddressService } from '../address';
import { IAddress } from 'app/shared/model/address.model';
import { PersonContact, PersonContactType, IPersonContact } from 'app/shared/model/person-contact.model';
import { ContactchallengeAccountModule } from 'app/account/account.module';
import { PersonContactService } from '../person-contact';

@Component({
    selector: 'jhi-person-update',
    templateUrl: './person-update.component.html'
})
export class PersonUpdateComponent implements OnInit {
    person: IPerson;
    isSaving: boolean;

    users: IUser[];
    birthdayDp: any;

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected personService: PersonService,
        protected userService: UserService,
        protected activatedRoute: ActivatedRoute,
        protected addressService: AddressService,
        protected changeDetectorRef: ChangeDetectorRef,
        protected contactService: PersonContactService
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ person }) => {
            this.person = person;
            if(this.person.addresses==null){
                this.person.addresses = [];
            }
            if(this.person.personContacts==null){
                this.person.personContacts = [];
            }
        });
        this.birthdayDp = moment(this.person.birthday).format('YYYY-MM-DD')
        this.userService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IUser[]>) => mayBeOk.ok),
                map((response: HttpResponse<IUser[]>) => response.body)
            )
            .subscribe((res: IUser[]) => (this.users = res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    previousState() {
        window.history.back();
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPerson>>) {
        result.subscribe((res: HttpResponse<IPerson>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    testPerson(){
        console.log("The value of person is: "+ JSON.stringify(this.person));
    }


    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackUserById(index: number, item: IUser) {
        return item.id;
    }

    addAddress(){
        console.log("Before: "+JSON.stringify(this.person))
        //this.addresses[this.addresses.length] = new Person();
        this.person.addresses.push(new Person());
        console.log("After: "+JSON.stringify(this.person));
    }

    addContact(){
        var contact = new PersonContact(null, PersonContactType.CELLPHONE, '','', null);
        this.person.personContacts.push(contact);
        //this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    }

    async savePerson(){
        this.person.birthday = moment(this.birthdayDp);
        this.person.userLogin = 'admin';
        console.log(JSON.stringify(this.person.addresses));
        //this.person.userId = 1;
        if(this.person.id!=null){
            for(let address of this.person.addresses){
                if(address.personId!=null){
                    this.addressService.update(address).subscribe((entity) => {
                        console.log("Update address: " + JSON.stringify(entity))
                    });
                }else{
                    address.personId = this.person.id
                    await this.addressService.create(address).subscribe((entity) => {
                        console.log("Create address: " + JSON.stringify(entity))
                        address=entity.body
                    });
                }
            }
            for(let contact of this.person.personContacts){
                this.contactService.update(contact).subscribe((entity) => {
                    console.log(entity)
                    contact = entity.body
                })
            }
            this.personService.update(this.person).subscribe((entity) => {
                alert("The person has been updated succesfully");
                console.log(JSON.stringify(entity));
                //return;
            })
        }else{
            this.personService.create(this.person)
            .subscribe((entity) => {
                alert("The person has been created succesfully");
                //this.person.id = entity.body.id
                this.person = entity.body;
                console.log(JSON.stringify(entity));
                return;
        });
        }
        
    }

}
