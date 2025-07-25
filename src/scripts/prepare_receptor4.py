# -----------------------------------------------------------------------------
#    Title: Autodock-vina-example: prepare_receptor4.py
#    Author: Shasha
#    Date: 2020
#    Code version: 1.0
#    Availability: https://github.com/sha256feng/Autodock-vina-example/blob/master/prepare_receptor4.py
# -----------------------------------------------------------------------------

import os
import sys
import getopt

# The following imports might need adjustment based on the exact Python 3 compatibility
# of the MolKit and AutoDockTools libraries.
# You might need to install them via pip: pip install MolKit AutoDockTools
from MolKit import Read
import MolKit.molecule
import MolKit.protein
from AutoDockTools.MoleculePreparation import AD4ReceptorPreparation


def usage():
    """Print helpful, accurate usage statement to stdout."""
    print("Usage: prepare_receptor4.py -r filename")
    print()
    print("    Description of command...")
    print("        -r  receptor_filename ")
    print("        supported file types include pdb,mol2,pdbq,pdbqs,pdbqt, possibly pqr,cif")
    print("    Optional parameters:")
    print("        [-v]  verbose output (default is minimal output)")
    print("        [-o pdbqt_filename]  (default is 'molecule_name.pdbqt')")
    print("        [-A]  type(s) of repairs to make: ")
    print("            'bonds_hydrogens': build bonds and add hydrogens ")
    print("            'bonds': build a single bond from each atom with no bonds to its closest neighbor")
    print("            'hydrogens': add hydrogens")
    print("            'checkhydrogens': add hydrogens only if there are none already")
    print("            'None': do not make any repairs ")
    print("            (default is 'checkhydrogens')")
    print("        [-C]  preserve all input charges ie do not add new charges ")
    print("            (default is addition of gasteiger charges)")
    print("        [-p]  preserve input charges on specific atom types, eg -p Zn -p Fe")
    print("        [-U]  cleanup type:")
    print("            'nphs': merge charges and remove non-polar hydrogens")
    print("            'lps': merge charges and remove lone pairs")
    print("            'waters': remove water residues")
    print("            'nonstdres': remove chains composed entirely of residues of")
    print("                         types other than the standard 20 amino acids")
    print("            'deleteAltB': remove XX@B atoms and rename XX@A atoms->XX")
    print("            (default is 'nphs_lps_waters_nonstdres') ")
    print("        [-e]  delete every nonstd residue from any chain")
    print("              'True': any residue whose name is not in this list:")
    print("                           ['CYS','ILE','SER','VAL','GLN','LYS','ASN', ")
    print("                           'PRO','THR','PHE','ALA','HIS','GLY','ASP', ")
    print("                           'LEU', 'ARG', 'TRP', 'GLU', 'TYR','MET', ")
    print("                           'HID', 'HSP', 'HIE', 'HIP', 'CYX', 'CSS']")
    print("                           will be deleted from any chain. ")
    print("              NB: there are no  nucleic acid residue names at all ")
    print("              in the list and no metals. ")
    print("            (default is False which means not to do this)")
    print("        [-M]  interactive ")
    print("            (default is 'automatic': outputfile is written with no further user input)")


if __name__ == '__main__':
    # process command arguments
    try:
        opt_list, args = getopt.getopt(sys.argv[1:], 'r:vo:A:Cp:U:eM:h')

    except getopt.GetoptError as msg:
        print(f'prepare_receptor4.py: {msg}')
        usage()
        sys.exit(2)

    # initialize required parameters
    #-s: receptor
    receptor_filename = None

    # optional parameters
    verbose = None
    #-A: repairs to make: add bonds and/or hydrogens or checkhydrogens
    repairs = ''
    #-C default: add gasteiger charges
    charges_to_add = 'gasteiger'
    #-p preserve charges on specific atom types
    preserve_charge_types = None
    #-U: cleanup by merging nphs_lps, nphs, lps, waters, nonstdres
    cleanup = "nphs_lps_waters_nonstdres"
    #-o outputfilename
    outputfilename = None
    #-m mode
    mode = 'automatic'
    #-e delete every nonstd residue from each chain
    delete_single_nonstd_residues = None

    #'r:vo:A:Cp:U:eMh'
    for o, a in opt_list:
        if o in ('-r', '--r'):
            receptor_filename = a
            if verbose:
                print(f'set receptor_filename to {a}')
        if o in ('-v', '--v'):
            verbose = True
            if verbose:
                print(f'set verbose to {True}')
        if o in ('-o', '--o'):
            outputfilename = a
            if verbose:
                print(f'set outputfilename to {a}')
        if o in ('-A', '--A'):
            repairs = a
            if verbose:
                print(f'set repairs to {a}')
        if o in ('-C', '--C'):
            charges_to_add = None
            if verbose:
                print('do not add charges')
        if o in ('-p', '--p'):
            if not preserve_charge_types:
                preserve_charge_types = a
            else:
                preserve_charge_types = preserve_charge_types + ',' + a
            if verbose:
                print(f'preserve initial charges on {preserve_charge_types}')
        if o in ('-U', '--U'):
            cleanup = a
            if verbose:
                print(f'set cleanup to {a}')
        if o in ('-e', '--e'):
            delete_single_nonstd_residues = True
            if verbose:
                print('set delete_single_nonstd_residues to True')
        if o in ('-M', '--M'):
            mode = a
            if verbose:
                print(f'set mode to {a}')
        if o in ('-h', '--'):
            usage()
            sys.exit()


    if not receptor_filename:
        print('prepare_receptor4: receptor filename must be specified.')
        usage()
        sys.exit()

    #what about nucleic acids???

    mols = Read(receptor_filename)
    if verbose:
        print(f'read {receptor_filename}')
    mol = mols[0]
    preserved = {}
    if charges_to_add is not None and preserve_charge_types is not None:
        preserved_types = preserve_charge_types.split(',')
        if verbose:
            print(f"preserved_types={preserved_types}")
        for t in preserved_types:
            if verbose:
                print(f'preserving charges on type->{t}')
            if not len(t):
                continue
            ats = mol.allAtoms.get(lambda x: x.autodock_element == t)
            if verbose:
                print(f"preserving charges on {ats.name}")
            for a in ats:
                if a.chargeSet is not None:
                    preserved[a] = [a.chargeSet, a.charge]

    if len(mols) > 1:
        if verbose:
            print("more than one molecule in file")
        #use the molecule with the most atoms
        ctr = 1
        for m in mols[1:]:
            ctr += 1
            if len(m.allAtoms) > len(mol.allAtoms):
                mol = m
                if verbose:
                    print(f"mol set to {ctr}th molecule with {len(mol.allAtoms)} atoms")
    mol.buildBondsByDistance()

    if verbose:
        print(f"setting up RPO with mode={mode},")
        print(f"and outputfilename= {outputfilename}")
        print(f"charges_to_add={charges_to_add}")
        print(f"delete_single_nonstd_residues={delete_single_nonstd_residues}")

    RPO = AD4ReceptorPreparation(mol, mode, repairs, charges_to_add,
                                 cleanup, outputfilename=outputfilename,
                                 preserved=preserved,
                                 delete_single_nonstd_residues=delete_single_nonstd_residues)

    if charges_to_add is not None:
        #restore any previous charges
        for atom, chargeList in preserved.items():
            atom._charges[chargeList[0]] = chargeList[1]
            atom.chargeSet = chargeList[0]

# To execute this command type:
# prepare_receptor4.py -r pdb_file -o outputfilename -A checkhydrogens