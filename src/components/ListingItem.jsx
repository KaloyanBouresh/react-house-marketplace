import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
import transmissionIcon from '../assets/svg/transmissionIcon.svg'
import distnaceIcon from '../assets/svg/distanceIcon.svg'

function ListingItem({ listing, id, onDelete, onEdit }) {
    return (
        <li className="categoryListing">
            <Link to={`/category/${ listing.type }/${ id }`}
                className="categoryListingLink">
                <img src={listing.imgUrls[0]} alt={listing.name} className="categoryListingImg" title='categoryListingImg' />

                <div className="categoryListingDetails">
                    <p className="categoryListingLocation">{listing.location}</p>
                    <p className="categoryListingName">{listing.name}</p>

                    <p className="categoryListingPrice">
                        {listing.offer ? listing.discountedPrice
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} lv
                        {listing.type === 'rent' && ' / Day'}
                    </p>

                    <div className="categoryListingInfoDiv">
                        <img src={distnaceIcon} alt="bed" title='mileage'/>
                        <p className='categoryListingInfoText'>
                            {listing.mileage} km
                        </p>

                        <img src={transmissionIcon} alt="transmission" title='transmission' />
                        <p className="categoryListingInfoText">
                            {listing.transmission} Transmission
                        </p>
                    </div>
                </div>
            </Link>


            {onDelete && (
                <DeleteIcon className='removeIcon' fill='rgb(231, 76, 60)'
                    onClick={() => onDelete(listing.id, listing.name)} />
            )}

            {onEdit && (
                <EditIcon className='editIcon' fill='rgb(115, 115, 115)'
                    onClick={() => onEdit(id)} />
            )}
        </li>
    )
}

export default ListingItem