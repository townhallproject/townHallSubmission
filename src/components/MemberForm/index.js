import React from 'react';
import PropTypes from 'prop-types';

import {
  AutoComplete,
  Input,
  Form,
  Radio,
  Icon,
  Button,
} from 'antd';
import { find } from 'lodash';
import renderCustomPersonForm from './customMemberForm';

import './style.scss';

const FormItem = Form.Item;

let uuid = 1;

class MemberLookup extends React.Component {
  constructor(props) {
    super(props);
    this.onNameSelect = this.onNameSelect.bind(this);
    this.formatDistrct = this.formatDistrct.bind(this);
    this.renderDatabaseLookupForm = this.renderDatabaseLookupForm.bind(this);
    this.memberForms = this.memberForms.bind(this);
    this.addMember = this.addMember.bind(this);
    this.removeAdditionalMember = this.removeAdditionalMember.bind(this);
  }

  onNameSelect(value, index) {
    const {
      allPeople,
      peopleDataUrl,
      requestPersonDataById,
      requestAdditionalPersonDataById,
    } = this.props;

    const person = find(allPeople, {
      nameEntered: value,
    });
    if (index > 0) {
      console.log('index bigger than 0', index);
      return requestAdditionalPersonDataById(peopleDataUrl, person.id);
    }
    requestPersonDataById(peopleDataUrl, person.id);
  }

  formatName() {
    const {
      currentTownHall,
      personMode,
      fields,
    } = this.props;
    const prefixMapping = {
      HD: 'House District',
      SD: 'Senate District',
      GOV: 'Governor',
      statewide: 'Governor',
      LTGOV: 'Lt. Governor',
      upper: 'Sen.',
      lower: 'Rep.',
      nationwide: 'President',
    };
    console.log('fields', fields)
    if (currentTownHall.displayName && personMode === 'moc') {
      return `${prefixMapping[currentTownHall.chamber]} ${currentTownHall.displayName} (${currentTownHall.party})`;
    }
    if (currentTownHall.displayName && personMode === 'candidate') {
      return `${currentTownHall.displayName} (${currentTownHall.party}), Running for: `;
    }
    return '';
  }

  formatDistrct() {
    const {
      currentTownHall,
      selectedUSState,
    } = this.props;
    if (selectedUSState) {
      return currentTownHall.district;
    }
    switch (currentTownHall.chamber) {
    case 'lower':
      return `${currentTownHall.state}-${currentTownHall.district}`;

    case 'upper':
      return 'Senate';

    case 'statewide':
      return currentTownHall.office || 'Statewide';
    case 'nationwide': 
      return currentTownHall.office || 'President';
    }
    return '';
  }

  addMember() {
    const {
      getFieldValue,
      setFieldsValue,
    } = this.props;
    // can use data-binding to get
    const keys = getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    setFieldsValue({
      keys: nextKeys,
    });
  }

  removeAdditionalMember(k) {
    const {
      getFieldValue,
      setFieldsValue,
    } = this.props;
    // can use data-binding to get
    const keys = getFieldValue('keys');
    // We need at least one member
    if (keys.length === 1) {
      return;
    }
    // can use data-binding to set
    setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  memberForms() {
    const {
      getFieldDecorator,
      getFieldValue,
    } = this.props;
    getFieldDecorator('keys', {
      initialValue: [0],
    });
    const keys = getFieldValue('keys');
    const formItems = keys.map(k => this.renderDatabaseLookupForm(k, keys));
    return formItems;
  }

  renderDatabaseLookupForm(key, keys) {
    const {
      allNames,
      getFieldDecorator,
      selectedUSState,
      personMode,
    } = this.props;
    const intro = personMode === 'candidate' ? 'Candidate for ' : 'Member of ';
    let title = `${intro}Congress Information `;
    if (selectedUSState) {
      title = `${intro + selectedUSState} state legislature information`;
    }
    return (
      <React.Fragment>
        <h4>
          {title}
          <br />
          <small>
            Enter their name and we will auto-fill the information
          </small>
        </h4>
        <FormItem
          key={key}
        >
          {getFieldDecorator('displayName', {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{ required: true, message: 'Please input a member of congress' }],
          })(
            <div>
              <AutoComplete
                style={{ width: '60%', marginRight: 8 }}
                key={key}
                dataSource={allNames}
                onSelect={value => this.onNameSelect(value, key)}
                filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                placeholder="Member of congress name"
              />

              {key > 0 ? (
                <Icon
                  className="dynamic-delete-button"
                  type="minus-circle-o"
                  disabled={keys.length === 1}
                  onClick={() => this.removeAdditionalMember(key)}
                />
              ) : null}
            </div>,
          )}

        </FormItem>
        <FormItem
          extra="How lawmaker or candidate name will be displayed"
        >
          <Input
            type="text"
            className="input-underline"
            id="person-preview"
            placeholder="Lawmaker/candidate info"
            value={`${this.formatName(key)} ${this.formatDistrct(key)}`}
            readOnly
          />
        </FormItem>
      </React.Fragment>
    );
  }

  static renderAdopterForm() {
    return (
      <section className="adopter-data non-standard hidden">
        <div className="form-group col-sm-12" id="adopter-member-form-group">
          <label htmlFor="districtAdopter">
            MOC appearing at event (adopter)
          </label>
          <Input type="text" class="form-control input-underline" id="districtAdopter" placeholder="Full name" value="" autocomplete="off" />
          <span id="adopter-member-help-block" className="help-block">
          Only first name and last name, not titles
          </span>
        </div>
      </section>
    );
  }

  render() {
    const {
      personMode,
      togglePersonMode,
      currentTownHall,
      selectedUSState,
    } = this.props;

    return (
      <section className="member-info">

        <Radio.Group
          defaultValue="moc"
          buttonStyle="solid"
          onChange={event => togglePersonMode(event.target.value)}
        >
          <Radio.Button value="moc">
            In office (Moc or Gov)
          </Radio.Button>
          <Radio.Button value="candidate">
            Candidate
          </Radio.Button>
          <Radio.Button value="manual">
            Manually Enter
          </Radio.Button>
        </Radio.Group>
        {personMode === 'manual' ? renderCustomPersonForm(
          {
            currentTownHall,
            selectedUSState,
          },
        ) : this.memberForms()}

        <div className="district-group federal-district-group" id="federal-district-group">

          <FormItem>
            <Button type="dashed" onClick={this.addMember} style={{ width: '60%' }}>
              <Icon type="plus" /> Add another lawmaker
            </Button>
          </FormItem>
        </div>


      </section>
    );
  }
}

MemberLookup.propTypes = {
  allPeople: PropTypes.arrayOf(PropTypes.shape(
    {
      id: PropTypes.number || PropTypes.string,
      nameEntered: PropTypes.string,
    },
  )).isRequired,
  allNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentTownHall: PropTypes.shape({}).isRequired,
  peopleDataUrl: PropTypes.string.isRequired,
  requestPersonDataById: PropTypes.func.isRequired,
};

// const WrappedMemberLookup = Form.create({
//   onFieldsChange(props, changedFields) {
//     // console.log(changedFields)
//   },
//   mapPropsToFields(props) {
//     const {
//       currentTownHall,
//     } = props;
//     return Form.createFormField({
//       displayName: currentTownHall.displayName,
//     })
//   },
//   onValuesChange(_, values) {
//     console.log(values);
//   },
// })(MemberLookup);
// export default WrappedMemberLookup;
export default MemberLookup;
